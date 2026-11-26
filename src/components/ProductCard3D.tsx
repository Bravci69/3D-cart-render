import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import type { ProductData } from '../types/product.ts'

interface ProductCard3DProps {
  product: ProductData
  autoRotate?: boolean
  autoRotateSpeed?: number
  hoverEffect?: boolean
}

export function ProductCard3D({
  product,
  autoRotate = true,
  autoRotateSpeed = 0.8,
  hoverEffect = true,
}: ProductCard3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  const textureMap = useTexture({
    front: product.textures.front,
    back: product.textures.back,
    side: product.textures.side || product.textures.front,
    top: product.textures.top || product.textures.front,
  })

  useEffect(() => {
    Object.values(textureMap).forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.generateMipmaps = true
      tex.anisotropy = 8
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.magFilter = THREE.LinearFilter
    })
  }, [textureMap])

  const isBoosterPack = product.type === 'booster-pack'
  const isTin = product.type === 'tin' || product.type === 'mini-tin'
  const isEtb = product.type === 'elite-trainer-box'
  const isBlister = product.type === 'blister-pack'

  // 6-face materials for native BoxGeometry (preserving clean [0..1] UV per face):
  // 0: +X Right, 1: -X Left, 2: +Y Top, 3: -Y Bottom, 4: +Z Front, 5: -Z Back
  const materials = useMemo(() => {
    const matProps = {
      roughness: product.material.roughness,
      metalness: product.material.metalness,
      clearcoat: product.material.clearcoat,
      clearcoatRoughness: product.material.clearcoatRoughness,
      iridescence: isBoosterPack ? 0.85 : isTin ? 0.3 : 0.15,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 360] as [number, number],
    }

    const sideMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.side,
      ...matProps,
      roughness: Math.min(1, matProps.roughness + 0.08),
    })

    const topMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.top,
      ...matProps,
      roughness: isTin ? 0.15 : 0.22,
      metalness: isBoosterPack ? 0.65 : matProps.metalness,
      clearcoat: 0.85,
    })

    const frontMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.front,
      ...matProps,
    })

    const backTex = textureMap.back.clone()
    backTex.colorSpace = THREE.SRGBColorSpace
    backTex.wrapS = THREE.RepeatWrapping
    backTex.repeat.x = -1
    backTex.offset.x = 1
    backTex.needsUpdate = true

    const backMat = new THREE.MeshPhysicalMaterial({
      map: backTex,
      ...matProps,
      roughness: Math.min(1, matProps.roughness + 0.1),
      metalness: Math.max(0, matProps.metalness - 0.1),
    })

    return [sideMat, sideMat, topMat, topMat, frontMat, backMat]
  }, [textureMap, product.material, isBoosterPack, isTin])

  const crimpMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: textureMap.top,
      roughness: 0.2,
      metalness: 0.75,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      iridescence: 0.8,
      iridescenceIOR: 1.35,
    })
  }, [textureMap.top])

  const trimMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      map: textureMap.top,
      roughness: isTin ? 0.16 : 0.3,
      metalness: isTin ? 0.88 : 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.12,
    })
  }, [textureMap.top, isTin])

  const blisterPlasticMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: '#e2e8f0',
      transparent: true,
      opacity: 0.16,
      roughness: 0.08,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95,
      depthWrite: false,
    })
  }, [])

  useEffect(() => {
    return () => {
      materials.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
      crimpMaterial.dispose()
      trimMaterial.dispose()
      blisterPlasticMaterial.dispose()
    }
  }, [materials, crimpMaterial, trimMaterial, blisterPlasticMaterial])

  useFrame((state, delta) => {
    if (!groupRef.current) return
    if (autoRotate) {
      groupRef.current.rotation.y += delta * (autoRotateSpeed * 0.5)
    }
    if (hoverEffect) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.04
    }
  })

  const { width, height, depth } = product.dimensions

  // 1. Foil Booster Pack with crimped top/bottom seals
  if (isBoosterPack) {
    const crimpHeight = 0.22
    const crimpThickness = 0.022
    const bodyHeight = Math.max(1.2, height - crimpHeight * 2)

    return (
      <group ref={groupRef}>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[width, bodyHeight, depth]} />
        </mesh>
        <mesh position={[0, bodyHeight / 2 + crimpHeight / 2, 0]} material={crimpMaterial} castShadow>
          <boxGeometry args={[width, crimpHeight, crimpThickness]} />
        </mesh>
        <mesh position={[0, -(bodyHeight / 2 + crimpHeight / 2), 0]} material={crimpMaterial} castShadow>
          <boxGeometry args={[width, crimpHeight, crimpThickness]} />
        </mesh>
      </group>
    )
  }

  // 2. Collector Tin & Mini Tin with overhanging metallic lid & rounded corner rails
  if (isTin) {
    const lidHeight = Math.max(0.22, height * 0.12)
    const bevel = product.type === 'mini-tin' ? 0.07 : 0.11
    const innerW = Math.max(0.4, width - bevel * 2)
    const innerD = Math.max(0.3, depth - bevel * 2)

    return (
      <group ref={groupRef}>
        {/* Textured crisp tin body */}
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[innerW + bevel * 1.35, height, innerD + bevel * 1.35]} />
        </mesh>

        {/* Rounded metallic corner columns */}
        {[
          [1, 1],
          [-1, 1],
          [1, -1],
          [-1, -1],
        ].map(([sx, sz], idx) => (
          <mesh
            key={idx}
            position={[sx * (innerW / 2), 0, sz * (innerD / 2)]}
            material={trimMaterial}
            castShadow
          >
            <cylinderGeometry args={[bevel * 0.9, bevel * 0.9, height - 0.01, 16]} />
          </mesh>
        ))}

        {/* Rolled Metallic Tin Lid Lip */}
        <mesh position={[0, height / 2 - lidHeight / 2 + 0.04, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[width * 1.02, lidHeight, depth * 1.04]} />
        </mesh>
      </group>
    )
  }

  // 3. Elite Trainer Box (ETB) with distinct telescoping top lid lip
  if (isEtb) {
    const lidSeamY = height * 0.24
    return (
      <group ref={groupRef}>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
        </mesh>
        {/* Subtle overhanging ETB lid trim collar */}
        <mesh position={[0, lidSeamY, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[width * 1.025, 0.055, depth * 1.025]} />
        </mesh>
        <mesh position={[0, height / 2 - 0.02, 0]} material={trimMaterial} castShadow>
          <boxGeometry args={[width * 1.015, 0.04, depth * 1.015]} />
        </mesh>
      </group>
    )
  }

  // 4. Blister Pack (cardboard backing + clear raised plastic shell in front)
  if (isBlister) {
    const cardDepth = Math.min(0.08, depth * 0.35)
    const bubbleDepth = Math.max(0.18, depth * 0.7)
    return (
      <group ref={groupRef}>
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[width, height, cardDepth]} />
        </mesh>
        {/* Clear transparent plastic blister dome */}
        <mesh
          position={[0, -height * 0.06, cardDepth / 2 + bubbleDepth / 2]}
          material={blisterPlasticMaterial}
        >
          <boxGeometry args={[width * 0.86, height * 0.76, bubbleDepth]} />
        </mesh>
      </group>
    )
  }

  // 5. Booster Box / Booster Bundle / Collection Box / Starter Deck / Build & Battle
  return (
    <group ref={groupRef}>
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
    </group>
  )
}

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

  // Load all available textures
  const textureMap = useTexture({
    front: product.textures.front,
    back: product.textures.back,
    side: product.textures.side || product.textures.front,
    top: product.textures.top || product.textures.front,
  })

  // Configure color space and crisp anisotropic filtering
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

  // Build materials for 6 faces of BoxGeometry:
  // 0: px (+X / Right side)
  // 1: nx (-X / Left side)
  // 2: py (+Y / Top)
  // 3: ny (-Y / Bottom)
  // 4: pz (+Z / Front face) -> PRIMARY ARTWORK
  // 5: nz (-Z / Back face)  -> UN-MIRRORED BACK TEXTURE
  const materials = useMemo(() => {
    const matProps = {
      roughness: product.material.roughness,
      metalness: product.material.metalness,
      clearcoat: product.material.clearcoat,
      clearcoatRoughness: product.material.clearcoatRoughness,
      iridescence: isBoosterPack ? 0.85 : 0.2,
      iridescenceIOR: 1.35,
      iridescenceThicknessRange: [120, 360] as [number, number],
    }

    // Side face material
    const sideMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.side,
      ...matProps,
      roughness: Math.min(1, matProps.roughness + 0.1),
    })

    // Top & bottom face material
    const topMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.top,
      ...matProps,
      roughness: 0.2,
      metalness: isBoosterPack ? 0.65 : matProps.metalness,
      clearcoat: 0.8,
    })

    // Front face material (PRIMARY ARTWORK)
    const frontMat = new THREE.MeshPhysicalMaterial({
      map: textureMap.front,
      ...matProps,
    })

    // Back face texture: clone and horizontally flip so text/barcodes are readable on -Z face
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
  }, [textureMap, product.material, isBoosterPack])

  // Metallic crimp material for booster pack top/bottom fins
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

  // Cleanup GPU resources on unmount
  useEffect(() => {
    return () => {
      materials.forEach((m) => {
        m.map?.dispose()
        m.dispose()
      })
      crimpMaterial.dispose()
    }
  }, [materials, crimpMaterial])

  // Subtle floating and auto-rotation
  useFrame((state, delta) => {
    if (!groupRef.current) return

    if (autoRotate) {
      groupRef.current.rotation.y += delta * (autoRotateSpeed * 0.5)
    }

    if (hoverEffect) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05
    }
  })

  const { width, height, depth } = product.dimensions

  // Authentically shaped Booster Pack with crimped tabs
  if (isBoosterPack) {
    const crimpHeight = 0.24
    const crimpThickness = 0.02
    const bodyHeight = height - crimpHeight * 2

    return (
      <group ref={groupRef}>
        {/* Main Pack Body */}
        <mesh material={materials} castShadow receiveShadow>
          <boxGeometry args={[width, bodyHeight, depth]} />
        </mesh>

        {/* Top Crimped Foil Tab */}
        <mesh
          position={[0, bodyHeight / 2 + crimpHeight / 2, 0]}
          material={crimpMaterial}
          castShadow
        >
          <boxGeometry args={[width, crimpHeight, crimpThickness]} />
        </mesh>

        {/* Bottom Crimped Foil Tab */}
        <mesh
          position={[0, -(bodyHeight / 2 + crimpHeight / 2), 0]}
          material={crimpMaterial}
          castShadow
        >
          <boxGeometry args={[width, crimpHeight, crimpThickness]} />
        </mesh>
      </group>
    )
  }

  // Display Box / ETB / Tin / Blister
  return (
    <group ref={groupRef}>
      <mesh material={materials} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
      </mesh>
    </group>
  )
}

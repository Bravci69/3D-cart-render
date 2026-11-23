import React, { Suspense, useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Center, Html } from '@react-three/drei'
import { RotateCw, RotateCcw, Maximize2, Minimize2, ZoomIn, Info } from 'lucide-react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { ProductCard3D } from './ProductCard3D.tsx'
import { LoadingSpinner } from './LoadingSpinner.tsx'
import type { ProductData } from '../types/product.ts'
import { DEFAULT_INTEGRATION_CONFIG } from '../config/integration.ts'

interface ProductViewerProps {
  product: ProductData
  height?: number | string
  interactive?: boolean
  showControls?: boolean
  showShadows?: boolean
  initialAutoRotate?: boolean
  className?: string
  onDetailsClick?: () => void
}

export const ProductViewer: React.FC<ProductViewerProps> = ({
  product,
  height = '500px',
  interactive = true,
  showControls = true,
  showShadows = true,
  initialAutoRotate = true,
  className = '',
  onDetailsClick,
}) => {
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err))
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch((err) => console.error(err))
      setIsFullscreen(false)
    }
  }

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  // Dynamically compute camera distance so any product (wide box or tall pack) fits cleanly
  const maxDim = Math.max(
    product.dimensions.width,
    product.dimensions.height,
    product.dimensions.depth
  )
  const cameraDistance = Math.max(5.2, maxDim * 1.85)

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black border border-slate-800 shadow-2xl select-none ${className}`}
      style={{ height: isFullscreen ? '100vh' : height }}
    >
      {/* 3D Canvas */}
      <Canvas
        key={product.id}
        dpr={[1, DEFAULT_INTEGRATION_CONFIG.renderConfig.maxPixelRatio]}
        camera={{ position: [0, 0, cameraDistance], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Suspense
          fallback={
            <Html center>
              <LoadingSpinner message={`Načítavam ${product.name}...`} />
            </Html>
          }
        >
          {/* Studio HDR Lighting */}
          <Environment preset="city" environmentIntensity={0.8} />

          {/* Lighting setup for foil and metallic sheen */}
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[4, 5, 4]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-4, 2, -2]} intensity={0.8} color="#93c5fd" />

          {/* Centered Product Mesh */}
          <Center>
            <ProductCard3D product={product} autoRotate={autoRotate} autoRotateSpeed={0.9} />
          </Center>

          {/* Soft baked floor shadow */}
          {showShadows && (
            <ContactShadows
              position={[0, -product.dimensions.height / 2 - 0.15, 0]}
              opacity={0.65}
              scale={maxDim * 2.5}
              blur={2.2}
              far={4}
              color="#020617"
            />
          )}

          {/* Camera Controls */}
          {interactive && (
            <OrbitControls
              ref={controlsRef}
              enablePan={false}
              minDistance={cameraDistance * 0.4}
              maxDistance={cameraDistance * 2.5}
              minPolarAngle={Math.PI / 4.5}
              maxPolarAngle={Math.PI / 1.6}
              dampingFactor={0.05}
              enableDamping
            />
          )}
        </Suspense>
      </Canvas>

      {/* Floating Header Info */}
      <div className="absolute top-4 left-4 z-10 flex flex-col pointer-events-none">
        <span className="text-xs uppercase tracking-widest font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 w-fit backdrop-blur-md">
          {product.type.replace('-', ' ')}
        </span>
        <h3 className="text-lg font-bold text-white mt-1.5 drop-shadow-md">{product.name}</h3>
        {product.price && (
          <span className="text-emerald-400 font-semibold text-sm">
            {product.price.toFixed(2)} {product.currency}
          </span>
        )}
      </div>

      {/* Control Toolbar */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? 'Zastaviť otáčanie' : 'Spustiť otáčanie'}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              autoRotate ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {autoRotate ? <RotateCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
          </button>

          <button
            onClick={resetCamera}
            title="Resetovať pohľad kamery"
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            title="Informácie o produkte"
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              showInfo ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Celá obrazovka"
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onDetailsClick && (
            <button
              onClick={onDetailsClick}
              className="ml-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-full shadow-md transition-all cursor-pointer"
            >
              Detail
            </button>
          )}
        </div>
      )}

      {/* Product Spec Drawer overlay */}
      {showInfo && (
        <div className="absolute inset-x-4 bottom-20 z-20 bg-slate-900/95 backdrop-blur-lg border border-slate-700 rounded-xl p-4 shadow-2xl text-xs text-slate-300 max-w-md mx-auto animate-in fade-in slide-in-from-bottom duration-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-white text-sm">{product.name}</h4>
            <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-white cursor-pointer">
              ✕
            </button>
          </div>
          <p className="text-slate-400 mb-3">{product.description}</p>
          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2 font-mono">
            <div>
              <span className="text-slate-500">Séria:</span> {product.series || 'N/A'}
            </div>
            <div>
              <span className="text-slate-500">Set:</span> {product.set || 'N/A'}
            </div>
            <div>
              <span className="text-slate-500">Rozmery:</span> {product.dimensions.width}×{product.dimensions.height}×
              {product.dimensions.depth}
            </div>
            <div>
              <span className="text-slate-500">Foil lesk:</span> {Math.round(product.material.clearcoat * 100)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

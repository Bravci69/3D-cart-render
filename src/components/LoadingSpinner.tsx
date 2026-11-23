import React from 'react'

interface LoadingSpinnerProps {
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Načítavam 3D model...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center select-none">
      {/* Animated Pokéball icon */}
      <div className="relative w-14 h-14 rounded-full border-4 border-slate-700 bg-slate-900 overflow-hidden animate-bounce shadow-xl">
        {/* Top red half */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-red-600 border-b-2 border-slate-800" />
        {/* Bottom white half */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-slate-100 border-t-2 border-slate-800" />
        {/* Center button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-slate-800 shadow-md flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-ping" />
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-slate-300 tracking-wide">{message}</p>
      <p className="text-xs text-slate-500 mt-1">Optimalizované WebGL vykresľovanie</p>
    </div>
  )
}

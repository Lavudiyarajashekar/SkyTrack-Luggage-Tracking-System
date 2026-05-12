'use client';

import { motion } from 'framer-motion'
import { Plane } from 'lucide-react';

interface FlightMapProps {
  origin?: string;
  destination?: string;
}

export default function FlightMap({ origin = "DEL", destination = "BOM" }: FlightMapProps){

  return(
    <div className="relative h-72 rounded-[36px] overflow-hidden glass-card">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-cyan-100/50" />
      
      {/* route curve */}
      <div className="absolute inset-0 flex items-center justify-center px-32">
        <svg width="100%" height="150" className="overflow-visible">
          <path
            d="M 0 75 Q 50% -50 100% 75"
            fill="transparent"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray="8 8"
            className="opacity-60"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Origin */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-sky-100 z-10">
          <span className="text-3xl">🛫</span>
        </div>
        <div className="mt-3 px-4 py-1 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm font-bold text-slate-800 text-lg">
          {origin}
        </div>
      </div>

      {/* Destination */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-blue-100 z-10">
          <span className="text-3xl">🛬</span>
        </div>
        <div className="mt-3 px-4 py-1 rounded-full bg-white/80 backdrop-blur-sm border shadow-sm font-bold text-slate-800 text-lg">
          {destination}
        </div>
      </div>

      {/* Animated Plane */}
      <motion.div
        animate={{
          x: ["0%", "100%"],
          y: [0, -30, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 10,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 -translate-y-1/2 left-32 right-32 z-20 pointer-events-none"
        style={{ transformOrigin: "center" }}
      >
        <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(14,165,233,0.5)] -ml-6 -mt-6">
          <Plane className="text-white w-6 h-6 rotate-45" />
        </div>
      </motion.div>
    </div>
  )
}
'use client';

import { motion } from 'framer-motion';
import { Plane, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative font-sans text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-950" />
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-sky-500/20 to-transparent blur-3xl" />
      
      {/* Animated Earth bg */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 200, ease: 'linear' }}
        className="absolute -bottom-[800px] left-1/2 -translate-x-1/2 w-[1600px] h-[1600px] rounded-full border border-white/5 bg-gradient-to-b from-sky-900/50 to-slate-900 shadow-[0_0_100px_rgba(14,165,233,0.2)]"
      >
        <div className="absolute inset-0 rounded-full border border-sky-500/20 m-20" />
        <div className="absolute inset-0 rounded-full border border-sky-400/10 m-40" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20 flex flex-col items-center justify-center min-h-screen text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-2xl shadow-sky-500/30 mb-8"
        >
          <Plane className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-sky-100 to-sky-400"
        >
          SkyTrack
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl text-sky-200/80 max-w-2xl mb-12 font-medium"
        >
          The next generation of real-time airline baggage operations. Track, manage, and deliver with absolute precision.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/login">
            <button className="px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-sky-50 transition-colors flex items-center gap-2 group shadow-xl shadow-white/10">
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link href="/signup">
            <button className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md text-white font-bold text-lg hover:bg-white/20 transition-colors border border-white/20">
              Create Account
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LandingScreenProps {
  onNext: () => void
}

export default function LandingScreen({ onNext }: LandingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center"
      >
        {/* Floating hearts animation */}
        <div className="relative mb-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ y: 0, opacity: 0.7 }}
              animate={{ 
                y: [-20, -60, -20],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.4
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: '-20px'
              }}
            >
              <Heart className="w-6 h-6 fill-rose-400 text-rose-400" />
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Heart className="w-20 h-20 mx-auto mb-6 fill-rose-500 text-rose-500" />
          
          <h1 className="text-4xl md:text-6xl font-bold text-rose-600 mb-4 font-serif">
            A Surprise for You
          </h1>
          
          <p className="text-lg md:text-xl text-rose-400 mb-8">
            Something special made with love
          </p>

          <Button
            onClick={onNext}
            size="lg"
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Open for Surprise ✨
          </Button>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-rose-300 text-sm"
        >
          ♥ Click to begin your journey ♥
        </motion.div>
      </motion.div>
    </div>
  )
}

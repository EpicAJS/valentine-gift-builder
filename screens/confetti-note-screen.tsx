'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConfettiNoteScreenProps {
  onNext: () => void
}

// PLACEHOLDER: Replace with your own message
const NOTE_MESSAGE = `My Dearest Valentine,

Every moment with you is a treasure I hold close to my heart. You make my world brighter, my days happier, and my life complete.

Thank you for being the amazing person you are, for your love, your laughter, and everything you bring to my life.

I love you more than words can express.

Forever yours,
[Your Name]`

export default function ConfettiNoteScreen({ onNext }: ConfettiNoteScreenProps) {
  const [noteOpened, setNoteOpened] = useState(false)
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; delay: number; duration: number; rotation: number }>>([])

  const openNote = () => {
    setNoteOpened(true)
    console.log('[v0] Play confetti sound')
    
    // Generate confetti hearts
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
    }))
    setConfetti(newConfetti)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti hearts */}
      <AnimatePresence>
        {noteOpened && confetti.map((conf) => (
          <motion.div
            key={conf.id}
            initial={{ y: -100, opacity: 1, rotate: conf.rotation }}
            animate={{ 
              y: window.innerHeight + 100,
              rotate: conf.rotation + 360,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: conf.duration,
              delay: conf.delay,
              ease: 'linear'
            }}
            className="absolute pointer-events-none"
            style={{ left: `${conf.x}%` }}
          >
            <Heart 
              className={`w-4 h-4 fill-rose-${Math.random() > 0.5 ? '400' : '500'} text-rose-${Math.random() > 0.5 ? '400' : '500'}`}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-2xl w-full relative z-10">
        <AnimatePresence mode="wait">
          {!noteOpened ? (
            // Closed envelope
            <motion.div
              key="envelope"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="inline-block cursor-pointer"
                onClick={openNote}
              >
                <svg width="300" height="200" viewBox="0 0 300 200" className="drop-shadow-2xl">
                  {/* Envelope body */}
                  <rect x="20" y="60" width="260" height="140" fill="#FFF1F2" stroke="#FB7185" strokeWidth="3" rx="5" />
                  
                  {/* Envelope flap */}
                  <path
                    d="M 20 60 L 150 140 L 280 60"
                    fill="#FFF1F2"
                    stroke="#FB7185"
                    strokeWidth="3"
                  />
                  <path
                    d="M 20 60 L 150 140 L 280 60 L 150 20 Z"
                    fill="#FECDD3"
                    stroke="#FB7185"
                    strokeWidth="3"
                  />
                  
                  {/* Heart seal */}
                  <motion.g
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <circle cx="150" cy="100" r="25" fill="#FB7185" />
                    <Heart className="translate-x-[137px] translate-y-[87px] w-6 h-6 fill-white text-white" />
                  </motion.g>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <p className="text-rose-400 text-xl mb-4">
                  A special message awaits...
                </p>
                <Button
                  onClick={openNote}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full"
                >
                  Open the Note ✉️
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            // Opened note
            <motion.div
              key="note"
              initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', duration: 0.8 }}
              className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative"
            >
              {/* Decorative corners */}
              <div className="absolute top-4 left-4">
                <Heart className="w-6 h-6 fill-rose-300 text-rose-300" />
              </div>
              <div className="absolute top-4 right-4">
                <Heart className="w-6 h-6 fill-rose-300 text-rose-300" />
              </div>
              <div className="absolute bottom-4 left-4">
                <Sparkles className="w-6 h-6 text-rose-300" />
              </div>
              <div className="absolute bottom-4 right-4">
                <Sparkles className="w-6 h-6 text-rose-300" />
              </div>

              {/* Note content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 mx-auto mb-4 fill-rose-500 text-rose-500" />
                  <h2 className="text-3xl md:text-4xl font-bold text-rose-600 font-serif">
                    A Note From My Heart
                  </h2>
                </div>

                <div className="prose prose-rose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg text-center md:text-left">
                    {NOTE_MESSAGE}
                  </p>
                </div>

                <div className="flex justify-center gap-2 py-4">
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                    >
                      <Heart className="w-5 h-5 fill-rose-400 text-rose-400" />
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center pt-6"
                >
                  <Button
                    onClick={onNext}
                    size="lg"
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full"
                  >
                    Back to Beginning 🏠
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ChocolateBoxScreenProps {
  onNext: () => void
}

// PLACEHOLDER: Replace with your own reasons
const CHOCOLATES = [
  { id: 1, reason: 'Your beautiful smile lights up my world' },
  { id: 2, reason: 'The way you laugh at my silly jokes' },
  { id: 3, reason: 'How you always know when I need a hug' },
  { id: 4, reason: 'Your kindness to everyone around you' },
  { id: 5, reason: 'The adventures we share together' },
  { id: 6, reason: 'How you believe in me' },
  { id: 7, reason: 'Your incredible strength and courage' },
  { id: 8, reason: 'The way you make ordinary moments special' },
  { id: 9, reason: 'How you listen and truly understand' },
  { id: 10, reason: 'Your passion for life' },
  { id: 11, reason: 'The comfort of your presence' },
  { id: 12, reason: 'How you inspire me every day' },
  { id: 13, reason: 'Your beautiful heart' },
  { id: 14, reason: 'Simply everything about you' },
]

export default function ChocolateBoxScreen({ onNext }: ChocolateBoxScreenProps) {
  const [openedChocolates, setOpenedChocolates] = useState<number[]>([])
  const [selectedChocolate, setSelectedChocolate] = useState<number | null>(null)
  const [allOpened, setAllOpened] = useState(false)

  useEffect(() => {
    if (openedChocolates.length === CHOCOLATES.length) {
      setAllOpened(true)
    }
  }, [openedChocolates])

  const openChocolate = (id: number) => {
    if (!openedChocolates.includes(id)) {
      setOpenedChocolates([...openedChocolates, id])
      // Play sound effect (placeholder)
      console.log('[v0] Play chocolate open sound')
    }
    setSelectedChocolate(id)
  }

  const closeModal = () => {
    setSelectedChocolate(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Heart className="w-12 h-12 mx-auto mb-4 fill-rose-500 text-rose-500" />
          <h2 className="text-3xl md:text-5xl font-bold text-rose-600 mb-2 font-serif">
            14 Reasons I Love You
          </h2>
          <p className="text-rose-400 text-lg">
            Click each chocolate to discover why you're special
          </p>
          <p className="text-rose-300 text-sm mt-2">
            {openedChocolates.length} of {CHOCOLATES.length} opened
          </p>
        </motion.div>

        {/* Chocolate box */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-rose-800 to-pink-900 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Box decoration - pointer-events-none so it doesn't block the Continue button */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 text-6xl">♥</div>
            <div className="absolute bottom-4 right-4 text-6xl">♥</div>
          </div>

          {/* Ribbon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-pink-400 to-pink-500 shadow-lg pointer-events-none" />

          <div className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4 relative">
            {CHOCOLATES.map((chocolate, index) => (
              <motion.button
                key={chocolate.id}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05, type: 'spring' }}
                onClick={() => openChocolate(chocolate.id)}
                className="relative group"
              >
                <div className={`aspect-square rounded-lg transition-all duration-300 ${
                  openedChocolates.includes(chocolate.id)
                    ? 'bg-gradient-to-br from-amber-700 to-amber-900'
                    : 'bg-gradient-to-br from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900'
                } shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center`}>
                  {openedChocolates.includes(chocolate.id) ? (
                    <Heart className="w-1/2 h-1/2 fill-rose-400 text-rose-400" />
                  ) : (
                    <div className="text-amber-300 text-xl font-bold">{chocolate.id}</div>
                  )}
                </div>
                
                {/* Shimmer effect for unopened */}
                {!openedChocolates.includes(chocolate.id) && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </motion.button>
            ))}
          </div>

          {/* Continue button */}
          <AnimatePresence>
            {allOpened && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 text-center relative z-10"
              >
                <Button
                  type="button"
                  onClick={onNext}
                  size="lg"
                  className="relative z-10 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-full shadow-lg"
                >
                  All chocolates enjoyed! Continue →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Modal for showing reason */}
        <AnimatePresence>
          {selectedChocolate !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative"
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-rose-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-rose-500" />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                  >
                    <Heart className="w-16 h-16 mx-auto mb-4 fill-rose-500 text-rose-500" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-rose-600 mb-4 font-serif">
                    Reason #{selectedChocolate}
                  </h3>
                  
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {CHOCOLATES.find(c => c.id === selectedChocolate)?.reason}
                  </p>

                  <div className="mt-6 flex gap-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Heart key={i} className="w-4 h-4 fill-rose-300 text-rose-300" />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

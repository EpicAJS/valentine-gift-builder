'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface PhotoGalleryScreenProps {
  onNext: () => void
}

// PLACEHOLDER: Replace these with your actual photos
// To add your photos: upload them to /public/photos/ folder and update the paths below
// Example: { id: 1, url: '/photos/photo1.jpg', caption: 'Our first date' }
const PHOTOS = [
  { id: 1, url: '/gallery1.jpeg', caption: 'Our first date' },
  { id: 2, url: '/gallery2.jpeg', caption: 'That beautiful smile' },
  { id: 3, url: '/gallery3.jpg', caption: 'Adventure together' },
  { id: 4, url: '/gallery4.jpeg', caption: 'Making memories' },
  { id: 5, url: '/gallery5.jpeg', caption: 'Making memories' },
]

export default function PhotoGalleryScreen({ onNext }: PhotoGalleryScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const nextPhoto = () => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % PHOTOS.length)
  }

  const prevPhoto = () => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + PHOTOS.length) % PHOTOS.length)
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const imageUrl = PHOTOS[currentIndex].url?.includes('placeholder.svg') 
    ? '/placeholder.svg' 
    : PHOTOS[currentIndex].url || '/placeholder.svg'

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Heart className="w-12 h-12 mx-auto mb-4 fill-rose-500 text-rose-500" />
          <h2 className="text-3xl md:text-5xl font-bold text-rose-600 mb-2 font-serif">
            Our Beautiful Moments
          </h2>
          <p className="text-rose-400 text-lg">
            Every picture tells our story
          </p>
        </motion.div>

        {/* Photo carousel */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
          {/* Decorative hearts */}
          <div className="absolute top-4 right-4 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart key={i} className="w-4 h-4 fill-rose-200 text-rose-200" />
            ))}
          </div>

          <div className="relative h-[400px] md:h-[500px] mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
              >
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={PHOTOS[currentIndex].caption}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation arrows */}
            <button
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-rose-500" />
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-rose-500" />
            </button>
          </div>

          {/* Caption */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-xl text-rose-600 font-medium">
              {PHOTOS[currentIndex].caption}
            </p>
          </motion.div>

          {/* Dots indicator */}
          <div className="flex justify-center gap-2 mb-6">
            {PHOTOS.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1)
                  setCurrentIndex(index)
                }}
                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                    ? 'bg-rose-500 w-8'
                    : 'bg-rose-200 hover:bg-rose-300'
                  }`}
              />
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={onNext}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 rounded-full"
            >
              Continue to Next Surprise →
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

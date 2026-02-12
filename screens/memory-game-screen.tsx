'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Heart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MemoryGameScreenProps {
  onNext: () => void
}

// Add your images to public/memory/ (e.g. heart.png, flower.png)
const PAIRS: { id: string; image: string; label: string }[] = [
  { id: 'heart', image: '/c1.jpg', label: 'Heart' },
  { id: 'flower', image: '/c2.JPG', label: 'Flower' },
  { id: 'star', image: '/c3.jpeg', label: 'Star' },
  { id: 'sparkles', image: '/c4.jpeg', label: 'Sparkles' },
  { id: 'gift', image: '/c5.JPG', label: 'Gift' },
  { id: 'smile', image: '/c6.jpeg', label: 'Smile' },
  { id: 'music', image: '/c7.jpeg', label: 'Music' },
  { id: 'cherry', image: '/c8.JPG', label: 'Cherry' },
]

type CardState = {
  id: string
  pairId: string
  image: string
  flipped: boolean
  matched: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function buildDeck(): CardState[] {
  const doubled = PAIRS.flatMap((p) => [
    { id: `${p.id}-a`, pairId: p.id, image: p.image, flipped: false, matched: false },
    { id: `${p.id}-b`, pairId: p.id, image: p.image, flipped: false, matched: false },
  ])
  return shuffle(doubled)
}

export default function MemoryGameScreen({ onNext }: MemoryGameScreenProps) {
  const [cards, setCards] = useState<CardState[]>(() => buildDeck())
  const [openIds, setOpenIds] = useState<string[]>([])
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const flipBackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allMatched = useMemo(
    () => cards.length > 0 && cards.every((c) => c.matched),
    [cards]
  )

  useEffect(() => {
    if (allMatched) setWon(true)
  }, [allMatched])

  useEffect(() => {
    if (openIds.length !== 2 || lock) return
    setLock(true)
    setMoves((m) => m + 1)
    const [a, b] = openIds
    const cardA = cards.find((c) => c.id === a)
    const cardB = cards.find((c) => c.id === b)
    const match = cardA && cardB && cardA.pairId === cardB.pairId
    if (match) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true } : c
        )
      )
      setOpenIds([])
      setLock(false)
    } else {
      flipBackTimeoutRef.current = setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          )
        )
        setOpenIds([])
        setLock(false)
        flipBackTimeoutRef.current = null
      }, 800)
    }
  }, [openIds, lock, cards])

  useEffect(() => {
    return () => {
      if (flipBackTimeoutRef.current) clearTimeout(flipBackTimeoutRef.current)
    }
  }, [])

  const handleCardClick = (id: string) => {
    if (lock) return
    const card = cards.find((c) => c.id === id)
    if (!card || card.matched || card.flipped) return
    if (openIds.length >= 2) return
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    )
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8 pb-16">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-rose-500" />
          <h2 className="text-2xl md:text-4xl font-bold text-rose-600 mb-1 font-serif">
            Memory Match
          </h2>
          <p className="text-rose-400 text-base">
            Find all the matching pairs
          </p>
          <p className="text-rose-300 text-sm mt-1">
            {moves} moves · {cards.filter((c) => c.matched).length / 2} of {PAIRS.length} pairs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-4 gap-2 sm:gap-3"
        >
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              type="button"
              layout
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleCardClick(card.id)}
              disabled={card.matched || lock}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center p-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
                card.matched
                  ? 'border-rose-300 bg-rose-100 cursor-default'
                  : card.flipped
                    ? 'border-rose-400 bg-white shadow-md'
                    : 'border-rose-200 bg-white/80 hover:bg-rose-50 hover:border-rose-300'
              }`}
            >
              <AnimatePresence mode="wait">
                {card.flipped || card.matched ? (
                  <motion.div
                    key="front"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="relative w-full h-full min-h-0 rounded-lg overflow-hidden"
                  >
                    <Image
                      src={card.image}
                      alt={PAIRS.find((p) => p.id === card.pairId)?.label ?? 'Card'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 25vw, 128px"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-200" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-rose-600 font-semibold mb-3">
                You did it in {moves} moves!
              </p>
              <Button
                onClick={onNext}
                size="lg"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-6 py-3 rounded-full shadow-lg"
              >
                <Heart className="w-4 h-4 mr-2 inline fill-current" />
                Continue →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

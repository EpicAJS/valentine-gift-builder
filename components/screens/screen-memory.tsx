"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MemoryScreenConfig,
  GiftScreen,
  Theme
} from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";
import { nanoid } from "nanoid";

type MemoryScreenData = Extract<GiftScreen, { type: "memory" }>;

type CardState = {
  id: string;
  pairId: string;
  image: string;
  flipped: boolean;
  matched: boolean;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function buildDeck(cards: MemoryScreenConfig["cards"]): CardState[] {
  const doubled = cards.flatMap((p) => [
    {
      id: `${p.id}-a`,
      pairId: p.id,
      image: p.image,
      flipped: false,
      matched: false
    },
    {
      id: `${p.id}-b`,
      pairId: p.id,
      image: p.image,
      flipped: false,
      matched: false
    }
  ]);
  return shuffle(doubled);
}

export function MemoryScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<MemoryScreenData>) {
  const [cards, setCards] = useState<CardState[]>(() => buildDeck(data.cards));
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const flipBackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const allMatched = useMemo(
    () => cards.length > 0 && cards.every((c) => c.matched),
    [cards]
  );

  useEffect(() => {
    if (allMatched && cards.length > 0) setWon(true);
  }, [allMatched, cards.length]);

  useEffect(() => {
    if (openIds.length !== 2 || lock) return;
    setLock(true);
    setMoves((m) => m + 1);
    const [a, b] = openIds;
    const cardA = cards.find((c) => c.id === a);
    const cardB = cards.find((c) => c.id === b);
    const match = cardA && cardB && cardA.pairId === cardB.pairId;
    if (match) {
      setCards((prev) =>
        prev.map((c) =>
          c.id === a || c.id === b ? { ...c, matched: true } : c
        )
      );
      setOpenIds([]);
      setLock(false);
    } else {
      flipBackTimeoutRef.current = setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, flipped: false } : c
          )
        );
        setOpenIds([]);
        setLock(false);
        flipBackTimeoutRef.current = null;
      }, 800);
    }
  }, [openIds, lock, cards]);

  useEffect(() => {
    return () => {
      if (flipBackTimeoutRef.current) clearTimeout(flipBackTimeoutRef.current);
    };
  }, []);

  const handleCardClick = (id: string) => {
    if (lock) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || card.flipped) return;
    if (openIds.length >= 2) return;
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (!data.cards.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This memory game needs at least a few cards.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  const accent = theme?.accent ?? "#fb7185";

  return (
    <div className="min-h-screen flex flex-col items-center p-4 py-8 pb-16" style={{ background: theme?.background ?? "#fff1f2" }}>
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: accent }} />
          <h2 className="text-2xl md:text-4xl font-bold text-rose-600 mb-1 font-serif">
            Memory Match
          </h2>
          <p className="text-rose-400 text-base">
            Find all the matching pairs
          </p>
          <p className="text-rose-300 text-sm mt-1">
            {moves} moves · {cards.filter((c) => c.matched).length / 2} of{" "}
            {data.cards.length} pairs
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
                  ? "border-rose-300 bg-rose-100 cursor-default"
                  : card.flipped
                  ? "border-rose-400 bg-white shadow-md"
                  : "border-rose-200 bg-white/80 hover:bg-rose-50 hover:border-rose-300"
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
                      alt={
                        data.cards.find((p) => p.id === card.pairId)?.label ??
                        "Card"
                      }
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
              <Button size="lg" onClick={onNext}>
                <Heart className="w-4 h-4 mr-2 inline fill-current" />
                Continue →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function MemoryScreenEditor({
  value,
  onChange
}: ScreenEditorProps<MemoryScreenConfig>) {
  const updateCard = (
    index: number,
    field: "image" | "label",
    newValue: string
  ) => {
    const next = [...value.cards];
    next[index] = { ...next[index], [field]: newValue };
    onChange({ ...value, cards: next });
  };

  const addCard = () => {
    if (value.cards.length >= 6) return;
    onChange({
      ...value,
      cards: [
        ...value.cards,
        {
          id: nanoid(6),
          image: "https://",
          label: ""
        }
      ]
    });
  };

  const removeCard = (index: number) => {
    onChange({
      ...value,
      cards: value.cards.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add 4–6 images to turn into a cute little memory game.
      </p>
      <div className="space-y-3">
        {value.cards.map((card, index) => (
          <div
            key={card.id}
            className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-white p-3"
          >
            <div className="flex gap-2 items-center">
              <span className="w-6 text-xs text-rose-400">
                {index + 1}
              </span>
              <input
                type="text"
                value={card.image}
                onChange={(e) =>
                  updateCard(index, "image", e.target.value)
                }
                placeholder="Image URL"
                className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeCard(index)}
              >
                Remove
              </Button>
            </div>
            <input
              type="text"
              value={card.label || ""}
              onChange={(e) =>
                updateCard(index, "label", e.target.value)
              }
              placeholder="Label (optional)"
              className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        ))}
      </div>
      {value.cards.length < 6 && (
        <Button type="button" size="sm" onClick={addCard}>
          Add another pair
        </Button>
      )}
    </div>
  );
}


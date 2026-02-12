"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  MatchingPairsScreenConfig,
  GiftScreen,
  Theme
} from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";
import { nanoid } from "nanoid";

type MatchingPairsScreenData = Extract<GiftScreen, { type: "matchingPairs" }>;

type CardState = {
  id: string;
  pairId: string;
  text: string;
  isQuestion: boolean;
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

function buildDeck(pairs: MatchingPairsScreenConfig["pairs"]): CardState[] {
  const cards: CardState[] = [];
  pairs.forEach((pair) => {
    cards.push({
      id: `${pair.id}-q`,
      pairId: pair.id,
      text: pair.question,
      isQuestion: true,
      flipped: false,
      matched: false
    });
    cards.push({
      id: `${pair.id}-a`,
      pairId: pair.id,
      text: pair.answer,
      isQuestion: false,
      flipped: false,
      matched: false
    });
  });
  return shuffle(cards);
}

export function MatchingPairsScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<MatchingPairsScreenData>) {
  const [cards, setCards] = useState<CardState[]>(() => buildDeck(data.pairs));
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
    
    // Check if one is question and one is answer, and they belong to same pair
    const match =
      cardA &&
      cardB &&
      cardA.pairId === cardB.pairId &&
      cardA.isQuestion !== cardB.isQuestion;

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
      }, 1000);
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
    
    // Don't allow selecting two questions or two answers
    if (openIds.length === 1) {
      const firstCard = cards.find((c) => c.id === openIds[0]);
      if (firstCard && firstCard.isQuestion === card.isQuestion) return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
    );
    setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  if (!data.pairs.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Sparkles className="w-10 h-10 mx-auto mb-2 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This matching game needs at least a few pairs.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  const accent = theme?.accent ?? "#fb7185";

  return (
    <div
      className="min-h-screen flex flex-col items-center p-4 py-8 pb-16"
      style={{ background: theme?.background ?? "#fff1f2" }}
    >
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <Sparkles className="w-10 h-10 mx-auto mb-3" style={{ color: accent }} />
          <h2 className="text-2xl md:text-4xl font-bold text-rose-600 mb-1 font-serif">
            Perfect Match
          </h2>
          <p className="text-rose-400 text-base">
            Match each question with its answer
          </p>
          <p className="text-rose-300 text-sm mt-1">
            {moves} moves · {cards.filter((c) => c.matched).length / 2} of{" "}
            {data.pairs.length} pairs matched
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
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
              className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 ${
                card.matched
                  ? "border-green-400 bg-green-100 cursor-default"
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
                    className="w-full h-full flex flex-col items-center justify-center text-center"
                  >
                    <div
                      className={`text-xs font-semibold mb-1 ${
                        card.isQuestion ? "text-blue-600" : "text-purple-600"
                      }`}
                    >
                      {card.isQuestion ? "Q" : "A"}
                    </div>
                    <p className="text-xs md:text-sm font-medium text-gray-700 leading-tight">
                      {card.text}
                    </p>
                    {card.matched && (
                      <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="flex flex-col items-center justify-center"
                  >
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-200" />
                    <span className="text-xs text-rose-300 mt-1">
                      {card.isQuestion ? "Question" : "Answer"}
                    </span>
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
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              </motion.div>
              <p className="text-rose-600 font-semibold mb-3 text-lg">
                Perfect match! You did it in {moves} moves!
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

export function MatchingPairsScreenEditor({
  value,
  onChange
}: ScreenEditorProps<MatchingPairsScreenConfig>) {
  const updatePair = (
    index: number,
    field: "question" | "answer",
    newValue: string
  ) => {
    const next = [...value.pairs];
    next[index] = { ...next[index], [field]: newValue };
    onChange({ ...value, pairs: next });
  };

  const addPair = () => {
    if (value.pairs.length >= 12) return;
    onChange({
      ...value,
      pairs: [
        ...value.pairs,
        {
          id: nanoid(6),
          question: "",
          answer: ""
        }
      ]
    });
  };

  const removePair = (index: number) => {
    onChange({
      ...value,
      pairs: value.pairs.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add 4–12 question-answer pairs. Players will match questions with their answers.
      </p>
      <div className="space-y-4">
        {value.pairs.map((pair, index) => (
          <div
            key={pair.id}
            className="rounded-xl border border-rose-100 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-rose-400 font-medium">
                Pair {index + 1}
              </span>
              {value.pairs.length > 4 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removePair(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div>
              <label className="block text-xs text-blue-600 mb-1 font-medium">
                Question:
              </label>
              <input
                type="text"
                value={pair.question}
                onChange={(e) =>
                  updatePair(index, "question", e.target.value)
                }
                placeholder="e.g., Where did we first meet?"
                className="w-full rounded-lg border border-blue-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50/50"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-600 mb-1 font-medium">
                Answer:
              </label>
              <input
                type="text"
                value={pair.answer}
                onChange={(e) => updatePair(index, "answer", e.target.value)}
                placeholder="e.g., Coffee shop downtown"
                className="w-full rounded-lg border border-purple-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-purple-50/50"
              />
            </div>
          </div>
        ))}
      </div>
      {value.pairs.length < 12 && (
        <Button type="button" size="sm" onClick={addPair}>
          Add another pair
        </Button>
      )}
    </div>
  );
}

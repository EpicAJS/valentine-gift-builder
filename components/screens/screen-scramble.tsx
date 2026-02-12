"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ScrambleScreenConfig,
  GiftScreen,
  Theme
} from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";
import { nanoid } from "nanoid";

type ScrambleScreenData = Extract<GiftScreen, { type: "scramble" }>;

function shuffleString(str: string): string {
  const arr = str.split(" ");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join(" ");
}

export function ScrambleScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<ScrambleScreenData>) {
  const [solvedPhrases, setSolvedPhrases] = useState<Set<string>>(new Set());
  const [currentPhraseId, setCurrentPhraseId] = useState<string | null>(
    data.phrases[0]?.id ?? null
  );
  const [userInput, setUserInput] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const currentPhrase = useMemo(
    () => data.phrases.find((p) => p.id === currentPhraseId),
    [data.phrases, currentPhraseId]
  );

  const allSolved = useMemo(
    () => solvedPhrases.size === data.phrases.length && data.phrases.length > 0,
    [solvedPhrases.size, data.phrases.length]
  );

  const handleCheck = () => {
    if (!currentPhrase) return;
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedSolution = currentPhrase.solution.toLowerCase();

    if (normalizedInput === normalizedSolution) {
      setSolvedPhrases((prev) => new Set([...prev, currentPhrase.id]));
      if (currentPhrase.message?.trim()) setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        const nextIndex = data.phrases.findIndex((p) => p.id === currentPhraseId);
        if (nextIndex < data.phrases.length - 1) {
          setCurrentPhraseId(data.phrases[nextIndex + 1].id);
          setUserInput("");
        } else {
          setCurrentPhraseId(null);
        }
      }, currentPhrase.message?.trim() ? 2000 : 600);
    }
  };

  const handleReset = () => {
    setUserInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCheck();
    }
  };

  if (!data.phrases.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto mb-2 fill-rose-400 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This puzzle needs at least a few phrases.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  const accent = theme?.accent ?? "#fb7185";
  const background = theme?.background;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: background ?? "#fff1f2" }}
    >
      <div className="max-w-3xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <Heart
            className="w-12 h-12 mx-auto mb-4"
            style={{ fill: accent, color: accent }}
          />
          <h2 className="text-3xl md:text-5xl font-bold text-rose-600 mb-2 font-serif">
            Unscramble My Heart
          </h2>
          <p className="text-rose-400 text-lg">
            Rearrange the words to reveal my message
          </p>
          <p className="text-rose-300 text-sm mt-2">
            {solvedPhrases.size} of {data.phrases.length} solved
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {allSolved ? (
            <motion.div
              key="complete"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-rose-600 mb-4">
                You unscrambled all my love!
              </h3>
              <Button size="lg" onClick={onNext}>
                Continue →
              </Button>
            </motion.div>
          ) : currentPhrase ? (
            <motion.div
              key={currentPhrase.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden bg-white border border-rose-100"
              style={background ? { background } : undefined}
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-4 left-4 text-6xl">💌</div>
                <div className="absolute bottom-4 right-4 text-6xl">💌</div>
              </div>

              <div className="relative z-10 space-y-6">
                <div className="text-center">
                  <p className="text-rose-500 text-sm mb-4">
                    Phrase {data.phrases.findIndex((p) => p.id === currentPhrase.id) + 1} of {data.phrases.length}
                  </p>
                  <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6">
                    <p className="text-rose-600 text-xl md:text-2xl font-bold mb-2">
                      Scrambled:
                    </p>
                    <p className="text-rose-800 text-2xl md:text-3xl font-mono tracking-wider font-semibold">
                      {currentPhrase.scrambled}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-rose-600 text-sm mb-2 font-medium">
                      Your answer:
                    </label>
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type the unscrambled phrase..."
                      className="w-full rounded-xl border-2 border-rose-200 bg-white px-4 py-3 text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleCheck}
                      size="lg"
                      className="flex-1"
                    >
                      Check Answer
                    </Button>
                    <Button
                      type="button"
                      onClick={handleReset}
                      variant="ghost"
                      size="lg"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {showMessage && currentPhrase.message?.trim() && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center"
                    >
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <p className="text-green-800 font-semibold mb-2">Correct! 💕</p>
                      <p className="text-green-700 text-sm">{currentPhrase.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ScrambleScreenEditor({
  value,
  onChange
}: ScreenEditorProps<ScrambleScreenConfig>) {
  const updatePhrase = (
    index: number,
    field: "scrambled" | "solution" | "message",
    newValue: string
  ) => {
    const next = [...value.phrases];
    next[index] = { ...next[index], [field]: newValue };
    onChange({ ...value, phrases: next });
  };

  const addPhrase = () => {
    if (value.phrases.length >= 10) return;
    onChange({
      ...value,
      phrases: [
        ...value.phrases,
        {
          id: nanoid(6),
          scrambled: "",
          solution: "",
          message: ""
        }
      ]
    });
  };

  const removePhrase = (index: number) => {
    onChange({
      ...value,
      phrases: value.phrases.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add 3–10 phrases to unscramble. Enter the scrambled version and the solution, plus a message that appears when solved.
      </p>
      <div className="space-y-4">
        {value.phrases.map((phrase, index) => (
          <div
            key={phrase.id}
            className="rounded-xl border border-rose-100 bg-white p-4 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-rose-400 font-medium">
                Phrase {index + 1}
              </span>
              {value.phrases.length > 3 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removePhrase(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <div>
              <label className="block text-xs text-rose-500 mb-1">
                Scrambled phrase (what they see):
              </label>
              <input
                type="text"
                value={phrase.scrambled}
                onChange={(e) =>
                  updatePhrase(index, "scrambled", e.target.value)
                }
                placeholder="e.g., YOU LOVE I"
                className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs text-rose-500 mb-1">
                Solution (correct answer):
              </label>
              <input
                type="text"
                value={phrase.solution}
                onChange={(e) =>
                  updatePhrase(index, "solution", e.target.value)
                }
                placeholder="e.g., I LOVE YOU"
                className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs text-rose-500 mb-1">
                Message (optional, shown when solved):
              </label>
              <textarea
                value={phrase.message ?? ""}
                onChange={(e) =>
                  updatePhrase(index, "message", e.target.value)
                }
                placeholder="A sweet message revealed when they solve it (optional)"
                rows={2}
                className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>
        ))}
      </div>
      {value.phrases.length < 10 && (
        <Button type="button" size="sm" onClick={addPhrase}>
          Add another phrase
        </Button>
      )}
    </div>
  );
}

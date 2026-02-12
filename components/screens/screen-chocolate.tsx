"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ChocolateScreenConfig,
  GiftScreen,
  Theme
} from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";

type ChocolateScreenData = Extract<GiftScreen, { type: "chocolate" }>;

export function ChocolateScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<ChocolateScreenData>) {
  const reasons = data.reasons;
  const [openedChocolates, setOpenedChocolates] = useState<number[]>([]);
  const [selectedChocolate, setSelectedChocolate] = useState<number | null>(
    null
  );
  const [allOpened, setAllOpened] = useState(false);

  useEffect(() => {
    if (openedChocolates.length === reasons.length && reasons.length > 0) {
      setAllOpened(true);
    }
  }, [openedChocolates, reasons.length]);

  const openChocolate = (index: number) => {
    if (!openedChocolates.includes(index)) {
      setOpenedChocolates([...openedChocolates, index]);
      // Placeholder for sound if you ever add one
      // console.log("Open chocolate");
    }
    setSelectedChocolate(index);
  };

  const closeModal = () => {
    setSelectedChocolate(null);
  };

  const accentBg = theme?.background ?? "bg-gradient-to-br from-rose-800 to-pink-900";

  if (!reasons.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto mb-2 fill-rose-400 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This chocolate box is waiting for sweet reasons.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
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
            {reasons.length} Reasons I Love You
          </h2>
          <p className="text-rose-400 text-lg">
            Tap each chocolate to reveal a reason
          </p>
          <p className="text-rose-300 text-sm mt-2">
            {openedChocolates.length} of {reasons.length} opened
          </p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${accentBg} rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 text-6xl">♥</div>
            <div className="absolute bottom-4 right-4 text-6xl">♥</div>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 relative">
            {reasons.map((reason, index) => (
              <motion.button
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05, type: "spring" }}
                onClick={() => openChocolate(index)}
                className="relative group"
                type="button"
              >
                <div
                  className={`aspect-square rounded-lg transition-all duration-300 ${
                    openedChocolates.includes(index)
                      ? "bg-gradient-to-br from-amber-700 to-amber-900"
                      : "bg-gradient-to-br from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900"
                  } shadow-lg hover:shadow-xl transform hover:scale-110 flex items-center justify-center`}
                >
                  {openedChocolates.includes(index) ? (
                    <Heart className="w-1/2 h-1/2 fill-rose-400 text-rose-400" />
                  ) : (
                    <div className="text-amber-300 text-xl font-bold">
                      {index + 1}
                    </div>
                  )}
                </div>

                {!openedChocolates.includes(index) && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                )}
              </motion.button>
            ))}
          </div>

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
                  className="relative z-10"
                >
                  All chocolates enjoyed! Continue →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
                  type="button"
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-rose-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-rose-500" />
                </button>

                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                  >
                    <Heart className="w-16 h-16 mx-auto mb-4 fill-rose-500 text-rose-500" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-rose-600 mb-4 font-serif">
                    Reason #{selectedChocolate + 1}
                  </h3>

                  <p className="text-lg text-gray-700 leading-relaxed">
                    {reasons[selectedChocolate]}
                  </p>

                  <div className="mt-6 flex gap-1 justify-center">
                    {[...Array(5)].map((_, i) => (
                      <Heart
                        key={i}
                        className="w-4 h-4 fill-rose-300 text-rose-300"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ChocolateScreenEditor({
  value,
  onChange
}: ScreenEditorProps<ChocolateScreenConfig>) {
  const [localReasons, setLocalReasons] = useState<string[]>(
    value.reasons.length ? value.reasons : [""]
  );

  useEffect(() => {
    onChange({
      ...value,
      reasons: localReasons.filter((r) => r.trim().length > 0).slice(0, 12)
    });
  }, [localReasons, onChange, value]);

  const updateReason = (index: number, text: string) => {
    setLocalReasons((prev) =>
      prev.map((r, i) => (i === index ? text : r))
    );
  };

  const addReason = () => {
    if (localReasons.length >= 12) return;
    setLocalReasons((prev) => [...prev, ""]);
  };

  const removeReason = (index: number) => {
    setLocalReasons((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add up to 12 little reasons you love them.
      </p>
      <div className="space-y-3">
        {localReasons.map((reason, index) => (
          <div
            key={index}
            className="flex items-center gap-2 rounded-xl border border-rose-100 bg-white p-2"
          >
            <span className="w-6 text-xs text-rose-400">{index + 1}.</span>
            <input
              type="text"
              value={reason}
              onChange={(e) => updateReason(index, e.target.value)}
              placeholder="Because..."
              className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {localReasons.length > 1 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeReason(index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      {localReasons.length < 12 && (
        <Button type="button" size="sm" onClick={addReason}>
          Add another reason
        </Button>
      )}
    </div>
  );
}


"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, ExternalLink } from "lucide-react";
import { GiftConfig, GiftScreen, Theme } from "@/lib/giftSchema";
import { screenRegistry } from "@/components/screens/registry";
import { Button } from "@/components/ui/button";

function LandingScreen({
  onNext,
  theme
}: {
  onNext: () => void;
  theme?: Theme;
}) {
  const accent = theme?.accent ?? "#fb7185";
  const background = theme?.background;

  return (
    <div
      className={`min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 ${
        background ? "" : "bg-gradient-to-b from-rose-50 to-pink-50"
      }`}
      style={background ? { background } : undefined}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <div className="relative mb-8 h-16">
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
                ease: "easeInOut",
                delay: i * 0.4
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: "-20px"
              }}
            >
              <Heart className="w-6 h-6 fill-rose-400 text-rose-400" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Heart className="w-20 h-20 mx-auto mb-6 fill-rose-500 text-rose-500" />
          <h1 className="text-3xl md:text-5xl font-bold text-rose-600 mb-3 font-serif">
            A Surprise for You
          </h1>
          <p className="text-base md:text-lg text-rose-400 mb-8">
            Someone made this just for you.
          </p>
          <Button
            onClick={onNext}
            size="lg"
            className="px-8 py-4 text-lg"
          >
            Open your gift
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-rose-300 text-xs"
        >
          Tap to begin your little journey
        </motion.p>
      </motion.div>
    </div>
  );
}

function FinalNoteScreen({
  note,
  theme,
  onBackToStart
}: {
  note: GiftConfig["note"];
  theme?: Theme;
  onBackToStart: () => void;
}) {
  const accent = theme?.accent ?? "#fb7185";
  const background = theme?.background;

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: background ?? "#fff1f2" }}
    >
      <AnimatePresence>
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, opacity: 1, rotate: 0 }}
            animate={{
              y: typeof window !== "undefined" ? window.innerHeight + 100 : 600,
              rotate: 360,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: Math.random() * 1,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute pointer-events-none"
            style={{ left: `${Math.random() * 100}%` }}
          >
            <Heart className="w-4 h-4 fill-rose-300 text-rose-300" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 relative"
        >
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

          <div className="space-y-6">
            <div className="text-center mb-4">
              <Heart
                className="w-12 h-12 mx-auto mb-3"
                style={{ fill: accent, color: accent }}
              />
              <h2 className="text-2xl md:text-3xl font-bold text-rose-600 font-serif">
                {note.title || "A Note From My Heart"}
              </h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg text-center md:text-left">
              {note.body}
            </p>
            {note.from && (
              <p className="text-right text-rose-500 font-medium mt-4">
                — {note.from}
              </p>
            )}
            <div className="flex justify-center gap-2 py-4">
              {[...Array(7)].map((_, i) => (
                <Heart
                  key={i}
                  className="w-4 h-4 fill-rose-400 text-rose-400"
                />
              ))}
            </div>
            <div className="text-center pt-4 space-y-4">
              <Button size="lg" onClick={onBackToStart}>
                Back to beginning
              </Button>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 underline underline-offset-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Create your own gift at FromMe
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function GiftViewer({ config }: { config: GiftConfig }) {
  const [index, setIndex] = useState(-1);

  const goNext = () => {
    setIndex((prev) => {
      if (prev < config.screens.length) {
        return prev + 1;
      }
      return prev;
    });
  };

  const goBackToStart = () => setIndex(-1);

  if (index === -1) {
    return <LandingScreen onNext={goNext} theme={config.theme} />;
  }

  if (index < config.screens.length) {
    const screen = config.screens[index] as GiftScreen;
    const def = screenRegistry[screen.type];
    const Render = def.Render;
    return (
      <Render
        data={screen as any}
        theme={config.theme}
        onNext={goNext}
      />
    );
  }

  return (
    <FinalNoteScreen
      note={config.note}
      theme={config.theme}
      onBackToStart={goBackToStart}
    />
  );
}


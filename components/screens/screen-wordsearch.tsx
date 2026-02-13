"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  WordSearchScreenConfig,
  GiftScreen,
  Theme
} from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";
import { nanoid } from "nanoid";

type WordSearchScreenData = Extract<GiftScreen, { type: "wordSearch" }>;

type Cell = {
  letter: string;
  wordId: string | null;
  position: number;
};

type WordPosition = {
  wordId: string;
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
  direction: "horizontal" | "vertical" | "diagonal";
};

function generateWordSearch(
  words: WordSearchScreenConfig["words"],
  size: number = 15
): { grid: Cell[][]; positions: WordPosition[] } {
  const grid: Cell[][] = Array(size)
    .fill(null)
    .map(() =>
      Array(size)
        .fill(null)
        .map(() => ({ letter: "", wordId: null, position: 0 }))
    );

  const positions: WordPosition[] = [];
  const directions: Array<"horizontal" | "vertical" | "diagonal"> = [
    "horizontal",
    "vertical",
    "diagonal"
  ];

  words.forEach((word) => {
    const wordUpper = word.word.toUpperCase();
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      const startRow = Math.floor(Math.random() * size);
      const startCol = Math.floor(Math.random() * size);

      let endRow = startRow;
      let endCol = startCol;

      if (direction === "horizontal") {
        endCol = startCol + wordUpper.length - 1;
      } else if (direction === "vertical") {
        endRow = startRow + wordUpper.length - 1;
      } else {
        endRow = startRow + wordUpper.length - 1;
        endCol = startCol + wordUpper.length - 1;
      }

      if (
        endRow >= size ||
        endCol >= size ||
        endRow < 0 ||
        endCol < 0
      ) {
        attempts++;
        continue;
      }

      let canPlace = true;
      for (let i = 0; i < wordUpper.length; i++) {
        let row = startRow;
        let col = startCol;
        if (direction === "horizontal") {
          col = startCol + i;
        } else if (direction === "vertical") {
          row = startRow + i;
        } else {
          row = startRow + i;
          col = startCol + i;
        }

        if (
          grid[row][col].wordId !== null &&
          grid[row][col].wordId !== word.id
        ) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < wordUpper.length; i++) {
          let row = startRow;
          let col = startCol;
          if (direction === "horizontal") {
            col = startCol + i;
          } else if (direction === "vertical") {
            row = startRow + i;
          } else {
            row = startRow + i;
            col = startCol + i;
          }

          grid[row][col] = {
            letter: wordUpper[i],
            wordId: word.id,
            position: i
          };
        }

        positions.push({
          wordId: word.id,
          startRow,
          startCol,
          endRow,
          endCol,
          direction
        });
        placed = true;
      } else {
        attempts++;
      }
    }
  });

  // Fill empty cells with random letters
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col].letter === "") {
        grid[row][col].letter =
          alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  return { grid, positions };
}

export function WordSearchScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<WordSearchScreenData>) {
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [showMessage, setShowMessage] = useState<string | null>(null);

  const { grid, positions } = useMemo(
    () => generateWordSearch(data.words, 15),
    [data.words]
  );

  const allFound = useMemo(
    () => foundWords.size === data.words.length && data.words.length > 0,
    [foundWords.size, data.words.length]
  );

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const checkWord = (cellKeys: string[]) => {
    if (cellKeys.length < 2) return;

    const cells = cellKeys.map((key) => {
      const [row, col] = key.split("-").map(Number);
      return { row, col, cell: grid[row][col] };
    });

    // Check if all cells belong to the same word
    const wordIds = new Set(cells.map((c) => c.cell.wordId).filter(Boolean));
    if (wordIds.size !== 1) return;

    const wordId = Array.from(wordIds)[0] as string;
    if (!wordId) return;

    const word = data.words.find((w) => w.id === wordId);
    if (!word) return;

    // Check if the selected cells match the word length
    if (cells.length !== word.word.length) return;

    // Check if all cells belong to the word
    const allMatch = cells.every((c) => c.cell.wordId === wordId);

    if (allMatch && !foundWords.has(wordId)) {
      setFoundWords((prev) => new Set([...prev, wordId]));
      if (word?.message?.trim()) {
        setShowMessage(word.message);
        setTimeout(() => setShowMessage(null), 3000);
      }
    }
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelectedCells(new Set([getCellKey(row, col)]));
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (!isSelecting) return;
    const key = getCellKey(row, col);
    setSelectedCells((prev) => new Set([...prev, key]));
  };

  const handleCellTouchStart = useCallback(
    (e: React.TouchEvent, row: number, col: number) => {
      e.preventDefault();
      const key = getCellKey(row, col);
      const initial = new Set([key]);
      selectedCellsRef.current = initial;
      setIsSelecting(true);
      setSelectedCells(initial);
    },
    []
  );

  const gridRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef(false);
  const selectedCellsRef = useRef<Set<string>>(new Set());
  isSelectingRef.current = isSelecting;
  selectedCellsRef.current = selectedCells;

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isSelectingRef.current || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const cellEl = el?.closest("[data-cell-key]");
    const key = cellEl?.getAttribute("data-cell-key");
    if (key) {
      const next = new Set([...selectedCellsRef.current, key]);
      selectedCellsRef.current = next;
      setSelectedCells(next);
    }
  }, []);

  const handleEndSelection = useCallback(() => {
    if (isSelectingRef.current) {
      checkWord(Array.from(selectedCellsRef.current));
      setSelectedCells(new Set());
      setIsSelecting(false);
    }
  }, []);

  useEffect(() => {
    const onMouseUp = () => handleEndSelection();
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [handleEndSelection]);

  useEffect(() => {
    window.addEventListener("touchend", handleEndSelection, { passive: true });
    return () => window.removeEventListener("touchend", handleEndSelection);
  }, [handleEndSelection]);

  useEffect(() => {
    if (!isSelecting) return;
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    return () => document.removeEventListener("touchmove", handleTouchMove);
  }, [isSelecting, handleTouchMove]);

  if (!data.words.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto mb-2 fill-rose-400 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This word search needs at least 5 words.
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
      className="min-h-screen flex flex-col items-center p-4 sm:p-6 py-6 sm:py-8 pb-[calc(4rem+env(safe-area-inset-bottom))]"
      style={{ background: background ?? "#fff1f2" }}
    >
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6"
        >
          <Heart
            className="w-12 h-12 mx-auto mb-4"
            style={{ fill: accent, color: accent }}
          />
          <h2 className="text-3xl md:text-5xl font-bold text-rose-600 mb-2 font-serif">
            Word Search of Love
          </h2>
          <p className="text-rose-400 text-lg">
            Find all the words to reveal my messages
          </p>
          <p className="text-rose-300 text-sm mt-2">
            {foundWords.size} of {data.words.length} found
          </p>
          <p className="text-rose-300/80 text-xs mt-1 sm:mt-0" aria-hidden>
            Tap a letter, then drag to select a word
          </p>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl shadow-2xl p-6 md:p-8 relative overflow-hidden bg-white border border-rose-100"
              style={background ? { background } : undefined}
            >
              <div
                ref={gridRef}
                className="grid gap-1 select-none touch-none"
                style={{ gridTemplateColumns: `repeat(15, minmax(0, 1fr))`, touchAction: "none" }}
              >
                {grid.map((row, rowIdx) =>
                  row.map((cell, colIdx) => {
                    const key = getCellKey(rowIdx, colIdx);
                    const isSelected = selectedCells.has(key);
                    const isFound = cell.wordId
                      ? foundWords.has(cell.wordId)
                      : false;
                    const word = cell.wordId
                      ? data.words.find((w) => w.id === cell.wordId)
                      : null;

                    return (
                      <div
                        key={key}
                        data-cell-key={key}
                        role="button"
                        tabIndex={0}
                        onMouseDown={() => handleCellMouseDown(rowIdx, colIdx)}
                        onMouseEnter={() => handleCellMouseEnter(rowIdx, colIdx)}
                        onTouchStart={(e) => handleCellTouchStart(e, rowIdx, colIdx)}
                        className={`aspect-square flex items-center justify-center text-sm md:text-base font-bold rounded transition-all cursor-pointer select-none ${
                          isFound
                            ? "bg-green-200 text-green-800 border border-green-400"
                            : isSelected
                            ? "bg-rose-200 text-rose-900 border-2 border-rose-400"
                            : "bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100"
                        }`}
                      >
                        {cell.letter}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-64">
            <div className="bg-white rounded-2xl shadow-lg p-4 space-y-2">
              <h3 className="font-bold text-rose-600 mb-3">Words to find:</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {data.words.map((word) => {
                  const isFound = foundWords.has(word.id);
                  return (
                    <div
                      key={word.id}
                      className={`flex items-center gap-2 p-2 rounded ${
                        isFound
                          ? "bg-green-100 text-green-700 line-through"
                          : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isFound && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium">{word.word.toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 bg-green-50 border-2 border-green-300 rounded-xl p-4 text-center"
            >
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-green-800 font-semibold mb-1">Word found! 💕</p>
              <p className="text-green-700 text-sm">{showMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {allFound && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-rose-600 mb-4">
                You found all my words!
              </h3>
              <Button size="lg" onClick={onNext}>
                Continue →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function WordSearchScreenEditor({
  value,
  onChange
}: ScreenEditorProps<WordSearchScreenConfig>) {
  const updateWord = (
    index: number,
    field: "word" | "message",
    newValue: string
  ) => {
    const next = [...value.words];
    next[index] = { ...next[index], [field]: newValue };
    onChange({ ...value, words: next });
  };

  const addWord = () => {
    if (value.words.length >= 15) return;
    onChange({
      ...value,
      words: [
        ...value.words,
        {
          id: nanoid(6),
          word: "",
          message: ""
        }
      ]
    });
  };

  const removeWord = (index: number) => {
    onChange({
      ...value,
      words: value.words.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add 5–15 words for the word search. Each word should be 2+ characters. Add a message that appears when they find each word.
      </p>
      <div className="space-y-3">
        {value.words.map((word, index) => (
          <div
            key={word.id}
            className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 text-xs text-rose-400">{index + 1}.</span>
              <input
                type="text"
                value={word.word}
                onChange={(e) => updateWord(index, "word", e.target.value)}
                placeholder="Word to find (e.g., LOVE)"
                className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              {value.words.length > 5 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeWord(index)}
                >
                  Remove
                </Button>
              )}
            </div>
            <textarea
              value={word.message ?? ""}
              onChange={(e) => updateWord(index, "message", e.target.value)}
              placeholder="Message shown when this word is found (optional)"
              rows={2}
              className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        ))}
      </div>
      {value.words.length < 15 && (
        <Button type="button" size="sm" onClick={addWord}>
          Add another word
        </Button>
      )}
    </div>
  );
}

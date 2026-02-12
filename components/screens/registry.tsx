import type { Theme, GiftScreen, ScreenType, GalleryScreenConfig, ChocolateScreenConfig, MemoryScreenConfig, MatchingPairsScreenConfig, ScrambleScreenConfig, WordSearchScreenConfig } from "@/lib/giftSchema";
import { GalleryScreenRender, GalleryScreenEditor } from "./screen-gallery";
import { ChocolateScreenRender, ChocolateScreenEditor } from "./screen-chocolate";
import { MemoryScreenRender, MemoryScreenEditor } from "./screen-memory";
import { MatchingPairsScreenRender, MatchingPairsScreenEditor } from "./screen-matching";
import { ScrambleScreenRender, ScrambleScreenEditor } from "./screen-scramble";
import { WordSearchScreenRender, WordSearchScreenEditor } from "./screen-wordsearch";

export interface ScreenRenderProps<TData extends GiftScreen> {
  data: TData;
  theme?: Theme;
  onNext: () => void;
}

export interface ScreenEditorProps<TConfig> {
  value: TConfig;
  onChange: (value: TConfig) => void;
}

export interface ScreenDefinition<TConfig, TData extends GiftScreen> {
  type: ScreenType;
  label: string;
  description: string;
  defaultConfig: TConfig;
  Render: (props: ScreenRenderProps<TData>) => JSX.Element;
  Editor: (props: ScreenEditorProps<TConfig>) => JSX.Element;
}

export const screenRegistry: Record<
  ScreenType,
  ScreenDefinition<any, any>
> = {
  gallery: {
    type: "gallery",
    label: "Photo Gallery",
    description: "Carousel of your favorite photos together.",
    defaultConfig: {
      type: "gallery",
      photos: []
    } satisfies GalleryScreenConfig,
    Render: GalleryScreenRender,
    Editor: GalleryScreenEditor
  },
  chocolate: {
    type: "chocolate",
    label: "Reasons I Love You",
    description: "A chocolate box with tappable reasons.",
    defaultConfig: {
      type: "chocolate",
      reasons: []
    } satisfies ChocolateScreenConfig,
    Render: ChocolateScreenRender,
    Editor: ChocolateScreenEditor
  },
  memory: {
    type: "memory",
    label: "Memory Match",
    description: "A cute memory game with your photos.",
    defaultConfig: {
      type: "memory",
      cards: []
    } satisfies MemoryScreenConfig,
    Render: MemoryScreenRender,
    Editor: MemoryScreenEditor
  },
  matchingPairs: {
    type: "matchingPairs",
    label: "Perfect Match",
    description: "Match questions with their answers.",
    defaultConfig: {
      type: "matchingPairs",
      pairs: []
    } satisfies MatchingPairsScreenConfig,
    Render: MatchingPairsScreenRender,
    Editor: MatchingPairsScreenEditor
  },
  scramble: {
    type: "scramble",
    label: "Letter Scramble",
    description: "Unscramble words to reveal messages.",
    defaultConfig: {
      type: "scramble",
      phrases: []
    } satisfies ScrambleScreenConfig,
    Render: ScrambleScreenRender,
    Editor: ScrambleScreenEditor
  },
  wordSearch: {
    type: "wordSearch",
    label: "Word Search",
    description: "Find words hidden in a grid to reveal messages.",
    defaultConfig: {
      type: "wordSearch",
      words: []
    } satisfies WordSearchScreenConfig,
    Render: WordSearchScreenRender,
    Editor: WordSearchScreenEditor
  }
};

/** Screen types that can be chosen when creating a new gift. Gallery and memory are excluded but still render for existing links. */
export const availableScreenTypes: ScreenType[] = [
  "chocolate",
  "matchingPairs",
  "scramble",
  "wordSearch"
];


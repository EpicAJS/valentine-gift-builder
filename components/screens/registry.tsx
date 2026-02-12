import type { Theme, GiftScreen, ScreenType, GalleryScreenConfig, ChocolateScreenConfig, MemoryScreenConfig } from "@/lib/giftSchema";
import { GalleryScreenRender, GalleryScreenEditor } from "./screen-gallery";
import { ChocolateScreenRender, ChocolateScreenEditor } from "./screen-chocolate";
import { MemoryScreenRender, MemoryScreenEditor } from "./screen-memory";

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
  }
};

export const availableScreenTypes = Object.keys(
  screenRegistry
) as ScreenType[];


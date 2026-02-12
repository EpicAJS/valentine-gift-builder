import { z } from "zod";

export const themeSchema = z.object({
  accent: z.string().optional(),
  background: z.string().optional()
});

export type Theme = z.infer<typeof themeSchema>;

export const noteSchema = z.object({
  title: z.string().max(120).optional(),
  body: z
    .string()
    .min(1, "Please write a note for your recipient.")
    .max(2000, "Note is a bit too long for this card."),
  from: z.string().max(80).optional()
});

export type NoteConfig = z.infer<typeof noteSchema>;

export const galleryScreenSchema = z.object({
  type: z.literal("gallery"),
  photos: z
    .array(
      z.object({
        id: z.string(),
        url: z.string().url("Photo must be a valid URL"),
        caption: z.string().optional()
      })
    )
    .min(1, "Add at least one photo")
    .max(12, "Maximum of 12 photos")
});

export type GalleryScreenConfig = z.infer<typeof galleryScreenSchema>;

export const chocolateScreenSchema = z.object({
  type: z.literal("chocolate"),
  reasons: z
    .array(z.string().min(1, "Reason cannot be empty"))
    .min(1, "Add at least one reason")
    .max(14, "Maximum of 14 reasons")
});

export type ChocolateScreenConfig = z.infer<typeof chocolateScreenSchema>;

export const memoryScreenSchema = z.object({
  type: z.literal("memory"),
  cards: z
    .array(
      z.object({
        id: z.string(),
        image: z.string().url("Card image must be a valid URL"),
        label: z.string().optional()
      })
    )
    .min(4, "Add at least 4 cards")
    .max(12, "Maximum of 12 cards")
});

export type MemoryScreenConfig = z.infer<typeof memoryScreenSchema>;

export const matchingPairsScreenSchema = z.object({
  type: z.literal("matchingPairs"),
  pairs: z
    .array(
      z.object({
        id: z.string(),
        question: z.string().min(1, "Question cannot be empty"),
        answer: z.string().min(1, "Answer cannot be empty")
      })
    )
    .min(4, "Add at least 4 pairs")
    .max(12, "Maximum of 12 pairs")
});

export type MatchingPairsScreenConfig = z.infer<typeof matchingPairsScreenSchema>;

export const scrambleScreenSchema = z.object({
  type: z.literal("scramble"),
  phrases: z
    .array(
      z.object({
        id: z.string(),
        scrambled: z.string().min(1, "Scrambled phrase cannot be empty"),
        solution: z.string().min(1, "Solution cannot be empty"),
        message: z.string().optional()
      })
    )
    .min(3, "Add at least 3 phrases")
    .max(10, "Maximum of 10 phrases")
});

export type ScrambleScreenConfig = z.infer<typeof scrambleScreenSchema>;

export const wordSearchScreenSchema = z.object({
  type: z.literal("wordSearch"),
  words: z
    .array(
      z.object({
        id: z.string(),
        word: z.string().min(2, "Word must be at least 2 characters"),
        message: z.string().optional()
      })
    )
    .min(5, "Add at least 5 words")
    .max(15, "Maximum of 15 words")
});

export type WordSearchScreenConfig = z.infer<typeof wordSearchScreenSchema>;

export const screenSchema = z.discriminatedUnion("type", [
  galleryScreenSchema,
  chocolateScreenSchema,
  memoryScreenSchema,
  matchingPairsScreenSchema,
  scrambleScreenSchema,
  wordSearchScreenSchema
]);

export type GiftScreen = z.infer<typeof screenSchema>;
export type ScreenType = GiftScreen["type"];

export const giftConfigSchema = z.object({
  theme: themeSchema.optional(),
  screens: z.array(screenSchema).min(1).max(3),
  note: noteSchema
});

export type GiftConfig = z.infer<typeof giftConfigSchema>;


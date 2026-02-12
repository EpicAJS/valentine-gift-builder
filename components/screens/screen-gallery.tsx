"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryScreenConfig, GiftScreen } from "@/lib/giftSchema";
import type { ScreenEditorProps, ScreenRenderProps } from "./registry";
import { useGiftBuilder } from "@/lib/giftBuilderContext";
import { supabaseBrowserClient } from "@/lib/supabase/client";
import { nanoid } from "nanoid";

type GalleryScreenData = Extract<GiftScreen, { type: "gallery" }>;

export function GalleryScreenRender({
  data,
  theme,
  onNext
}: ScreenRenderProps<GalleryScreenData>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const photos = data.photos;

  if (!photos.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-xl w-full text-center space-y-4">
          <Heart className="w-10 h-10 mx-auto mb-2 fill-rose-400 text-rose-400" />
          <p className="text-rose-500 font-medium">
            This gallery is waiting for photos.
          </p>
          <Button onClick={onNext}>Continue</Button>
        </div>
      </div>
    );
  }

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const currentPhoto = photos[currentIndex];

  const accent = theme?.accent ?? "#fb7185";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: theme?.background ?? "#fff1f2" }}
    >
      <div className="max-w-4xl w-full">
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
            Our Beautiful Moments
          </h2>
          <p className="text-rose-400 text-lg">
            Every picture tells our story
          </p>
        </motion.div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-8 overflow-hidden">
          <div className="absolute top-4 right-4 flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart
                key={i}
                className="w-4 h-4"
                style={{ fill: "#fecdd3", color: "#fecdd3" }}
              />
            ))}
          </div>

          <div className="relative h-[400px] md:h-[500px] mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={currentPhoto.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="absolute inset-0"
              >
                <Image
                  src={currentPhoto.url}
                  alt={currentPhoto.caption || "Gallery photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => {
                setDirection(-1);
                setCurrentIndex(
                  (prev) => (prev - 1 + photos.length) % photos.length
                );
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft className="w-6 h-6 text-rose-500" />
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % photos.length);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg transition-all"
            >
              <ChevronRight className="w-6 h-6 text-rose-500" />
            </button>
          </div>

          <motion.div
            key={currentPhoto.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <p className="text-xl text-rose-600 font-medium">
              {currentPhoto.caption || "A special moment"}
            </p>
          </motion.div>

          <div className="flex justify-center gap-2 mb-6">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-rose-500 w-8"
                    : "bg-rose-200 hover:bg-rose-300"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <Button onClick={onNext}>Continue to Next Surprise →</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GalleryScreenEditor({
  value,
  onChange
}: ScreenEditorProps<GalleryScreenConfig>) {
  const { slug } = useGiftBuilder();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = (
    index: number,
    field: "url" | "caption",
    newValue: string
  ) => {
    const next = [...value.photos];
    next[index] = { ...next[index], [field]: newValue };
    onChange({ ...value, photos: next });
  };

  const addEmptyPhoto = () => {
    onChange({
      ...value,
      photos: [
        ...value.photos,
        { id: nanoid(8), url: "https://", caption: "" }
      ]
    });
  };

  const removePhoto = (index: number) => {
    const next = value.photos.filter((_, i) => i !== index);
    onChange({ ...value, photos: next });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || !supabaseBrowserClient || !slug) return;
    setError(null);
    const existing = value.photos.length;

    const maxToAdd = 12 - existing;
    const slice = Array.from(files).slice(0, maxToAdd);

    setUploading(true);
    try {
      const newPhotos = [...value.photos];

      for (const file of slice) {
        if (file.size > 8 * 1024 * 1024) {
          setError("Some files were over 8MB and were skipped.");
          continue;
        }

        const ext = file.name.split(".").pop() || "jpg";
        const id = nanoid(10);
        const path = `${slug}/${id}.${ext}`;

        const { error: uploadError } = await supabaseBrowserClient
          .storage
          .from("gift-assets")
          .upload(path, file);

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const { data } = supabaseBrowserClient
          .storage
          .from("gift-assets")
          .getPublicUrl(path);

        newPhotos.push({
          id,
          url: data.publicUrl,
          caption: ""
        });
      }

      onChange({ ...value, photos: newPhotos });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-rose-500">
        Add up to 12 photos. You can upload from your device or paste a photo
        link—uploads are stored safely with a secret link.
      </p>

      <div className="space-y-4">
        {value.photos.map((photo, index) => (
          <div
            key={photo.id}
            className="flex flex-col gap-2 rounded-xl border border-rose-100 bg-white p-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={photo.url}
                onChange={(e) =>
                  handlePhotoChange(index, "url", e.target.value)
                }
                placeholder="Photo URL"
                className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removePhoto(index)}
              >
                Remove
              </Button>
            </div>
            <input
              type="text"
              value={photo.caption || ""}
              onChange={(e) =>
                handlePhotoChange(index, "caption", e.target.value)
              }
              placeholder="Caption (optional)"
              className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          onClick={addEmptyPhoto}
          disabled={value.photos.length >= 12}
        >
          Add photo by URL
        </Button>

        <label className="text-sm text-rose-600">
          <span className="mr-2">Upload images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>

        {uploading && (
          <span className="text-xs text-rose-400">Uploading…</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-rose-500">
          {error}
        </p>
      )}
    </div>
  );
}


"use client";

import { useMemo, useState } from "react";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  GiftConfig,
  Theme,
  NoteConfig,
  giftConfigSchema,
  ScreenType,
  GiftScreen
} from "@/lib/giftSchema";
import {
  availableScreenTypes,
  screenRegistry
} from "@/components/screens/registry";
import { Button } from "@/components/ui/button";
import { GiftBuilderProvider } from "@/lib/giftBuilderContext";

type BuilderStep = 0 | 1 | 2 | 3 | 4;

const steps: { id: BuilderStep; label: string }[] = [
  { id: 0, label: "Theme" },
  { id: 1, label: "Screens" },
  { id: 2, label: "Configure" },
  { id: 3, label: "Note" },
  { id: 4, label: "Generate" }
];

function CreateGiftInner({ slug }: { slug: string }) {
  const [step, setStep] = useState<BuilderStep>(0);

  const [theme, setTheme] = useState<Theme>({
    accent: "#fb7185",
    background: "#fff1f2"
  });

  const [screens, setScreens] = useState<GiftScreen[]>([]);

  const [note, setNote] = useState<NoteConfig>({
    title: "A Note From My Heart",
    body: "",
    from: ""
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  const canGoNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return screens.length >= 1 && screens.length <= 3;
    if (step === 2) return screens.length >= 1;
    if (step === 3) return note.body.trim().length > 0;
    return true;
  }, [step, screens, note.body]);

  const goNext = () => {
    if (step < 4) setStep((s) => (s + 1) as BuilderStep);
  };

  const goBack = () => {
    if (step > 0) setStep((s) => (s - 1) as BuilderStep);
  };

  const toggleScreen = (type: ScreenType) => {
    setScreens((prev) => {
      const existingIndex = prev.findIndex((s) => s.type === type);
      if (existingIndex >= 0) {
        return prev.filter((s) => s.type !== type);
      }
      if (prev.length >= 3) {
        return prev;
      }
      const def = screenRegistry[type].defaultConfig as GiftScreen;
      return [...prev, def];
    });
  };

  const updateScreenConfig = (index: number, config: any) => {
    setScreens((prev) =>
      prev.map((s, i) => (i === index ? (config as GiftScreen) : s))
    );
  };

  const config: GiftConfig = {
    theme,
    screens,
    note
  };

  const handleSave = async () => {
    setValidationError(null);
    setSaveError(null);
    setSavedSlug(null);

    const parsed = giftConfigSchema.safeParse(config);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      setValidationError(firstError.message);
      setStep(3);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/gifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          slug,
          config: parsed.data
        })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to save gift");
      }

      const json = (await res.json()) as { slug: string };
      setSavedSlug(json.slug);
      setStep(4);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Something went wrong saving."
      );
    } finally {
      setSaving(false);
    }
  };

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://your-domain.com";

  const shareUrl = savedSlug
    ? `${baseUrl}/g/${encodeURIComponent(savedSlug)}`
    : "";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col px-4 py-6">
      <div className="max-w-3xl w-full mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-rose-600">
            Create your Valentine gift
          </h1>
          <p className="text-sm text-rose-400 mt-1">
            Choose up to three screens, customize them, then share a magic
            link.
          </p>
        </header>

        <nav className="flex items-center gap-2 mb-6 overflow-x-auto">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={s.id > step}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs border ${
                    isActive
                      ? "border-rose-500 bg-rose-50 text-rose-600"
                      : isComplete
                      ? "border-rose-300 bg-rose-100 text-rose-500"
                      : "border-rose-100 bg-white text-rose-300"
                  }`}
                >
                  <span className="font-semibold">{index + 1}</span>
                  <span>{s.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <span className="text-rose-200 text-xs">···</span>
                )}
              </div>
            );
          })}
        </nav>

        <section className="rounded-2xl bg-white shadow-sm border border-rose-100 p-4 sm:p-6 mb-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-600">
                Theme (optional)
              </h2>
              <p className="text-sm text-rose-400">
                Choose accent and background colors. You can tweak these later.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-rose-500">
                    Accent color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.accent ?? "#fb7185"}
                      onChange={(e) =>
                        setTheme((t) => ({
                          ...t,
                          accent: e.target.value
                        }))
                      }
                      className="h-9 w-9 rounded-full border border-rose-100"
                    />
                    <input
                      type="text"
                      value={theme.accent ?? ""}
                      onChange={(e) =>
                        setTheme((t) => ({
                          ...t,
                          accent: e.target.value
                        }))
                      }
                      className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-rose-500">
                    Background color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={theme.background ?? "#fff1f2"}
                      onChange={(e) =>
                        setTheme((t) => ({
                          ...t,
                          background: e.target.value
                        }))
                      }
                      className="h-9 w-9 rounded-full border border-rose-100"
                    />
                    <input
                      type="text"
                      value={theme.background ?? ""}
                      onChange={(e) =>
                        setTheme((t) => ({
                          ...t,
                          background: e.target.value
                        }))
                      }
                      className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-600">
                Choose up to three screens
              </h2>
              <p className="text-sm text-rose-400">
                Mix and match. You can reconfigure content in the next step.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {availableScreenTypes.map((type) => {
                  const def = screenRegistry[type];
                  const active = screens.some((s) => s.type === type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleScreen(type)}
                      className={`rounded-2xl border p-3 text-left text-sm transition ${
                        active
                          ? "border-rose-500 bg-rose-50 shadow-sm"
                          : "border-rose-100 bg-white hover:border-rose-200"
                      }`}
                    >
                      <div className="font-semibold text-rose-600">
                        {def.label}
                      </div>
                      <div className="text-rose-400 text-xs mt-1">
                        {def.description}
                      </div>
                      <div className="mt-2 text-[10px] text-rose-300 uppercase tracking-wide">
                        {active ? "Selected" : "Tap to select"}
                      </div>
                    </button>
                  );
                })}
              </div>
              {screens.length === 0 && (
                <p className="text-xs text-rose-500">
                  Choose at least one screen to continue.
                </p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-600">
                Configure screens
              </h2>
              {screens.length === 0 ? (
                <p className="text-sm text-rose-400">
                  Pick your screens first in the previous step.
                </p>
              ) : (
                <div className="space-y-4">
                  {screens.map((screen, index) => {
                    const def = screenRegistry[screen.type];
                    const Editor = def.Editor;
                    return (
                      <div
                        key={`${screen.type}-${index}`}
                        className="rounded-2xl border border-rose-100 bg-rose-50/60 p-3 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-rose-600">
                            {index + 1}. {def.label}
                          </div>
                          <button
                            type="button"
                            className="text-xs text-rose-400 underline"
                            onClick={() =>
                              setScreens((prev) =>
                                prev.filter((_, i) => i !== index)
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="text-xs text-rose-400 mb-1">
                          {def.description}
                        </div>
                        <Editor
                          value={screen as any}
                          onChange={(value) =>
                            updateScreenConfig(index, value)
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-600">
                Final note
              </h2>
              <p className="text-sm text-rose-400">
                This is the last screen your Valentine will see.
              </p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-rose-500">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={note.title ?? ""}
                    onChange={(e) =>
                      setNote((n) => ({ ...n, title: e.target.value }))
                    }
                    placeholder="A Note From My Heart"
                    className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-rose-500">
                    Message
                  </label>
                  <textarea
                    value={note.body}
                    onChange={(e) =>
                      setNote((n) => ({ ...n, body: e.target.value }))
                    }
                    rows={6}
                    placeholder="Write from the heart..."
                    className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-rose-500">
                    From (optional)
                  </label>
                  <input
                    type="text"
                    value={note.from ?? ""}
                    onChange={(e) =>
                      setNote((n) => ({ ...n, from: e.target.value }))
                    }
                    placeholder="Your name"
                    className="w-full rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
              {validationError && (
                <p className="text-xs text-rose-500">{validationError}</p>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-rose-600">
                Your shareable link
              </h2>
              {!savedSlug && (
                <p className="text-sm text-rose-400">
                  Click &ldquo;Generate link&rdquo; to save and get a URL.
                </p>
              )}
              {savedSlug && (
                <div className="space-y-3">
                  <p className="text-sm text-rose-500">
                    Gift saved! Share this link with your Valentine:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-xs sm:text-sm bg-rose-50/60"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(shareUrl);
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      Copy link
                    </Button>
                    <a
                      href={`/g/${encodeURIComponent(savedSlug)}`}
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-xs sm:text-sm text-rose-500 hover:bg-rose-50"
                    >
                      Preview
                    </a>
                  </div>
                </div>
              )}
              {saveError && (
                <p className="text-xs text-rose-500">{saveError}</p>
              )}
            </div>
          )}
        </section>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </Button>
          <div className="flex items-center gap-3">
            {step < 4 && (
              <Button
                type="button"
                size="sm"
                onClick={goNext}
                disabled={!canGoNext}
              >
                Next
              </Button>
            )}
            {step >= 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={saving || screens.length === 0}
              >
                {saving ? "Saving…" : "Generate link"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateGiftPage() {
  const [slug] = useState(() => nanoid(10));

  return (
    <GiftBuilderProvider slug={slug}>
      <CreateGiftInner slug={slug} />
    </GiftBuilderProvider>
  );
}


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

/** Build a config with placeholder note so we can validate only screens. */
function configWithPlaceholderNote(config: GiftConfig): GiftConfig {
  return {
    ...config,
    note: { title: "", body: "placeholder", from: "" }
  };
}

/** Format Zod config errors into a list of user-friendly messages. */
function formatConfigErrors(
  config: GiftConfig,
  error: z.ZodError
): string[] {
  const screens = config.screens;
  const messages: string[] = [];
  for (const issue of error.issues) {
    const path = issue.path as (string | number)[];
    if (path[0] === "screens" && typeof path[1] === "number") {
      const screenIndex = path[1];
      const screen = screens[screenIndex];
      const label = screen
        ? screenRegistry[screen.type as ScreenType]?.label ?? `Screen ${screenIndex + 1}`
        : `Screen ${screenIndex + 1}`;
      messages.push(`Screen ${screenIndex + 1} (${label}): ${issue.message}`);
    } else if (path[0] === "note") {
      const field = path[1] === "body" ? "Message" : path[1] === "title" ? "Title" : path[1] === "from" ? "From" : String(path[1]);
      messages.push(`Note — ${field}: ${issue.message}`);
    } else {
      messages.push(issue.message);
    }
  }
  return [...new Set(messages)];
}
import { Button } from "@/components/ui/button";
import { GiftBuilderProvider } from "@/lib/giftBuilderContext";
import { useRouter } from "next/navigation";

type BuilderStep = 0 | 1 | 2 | 3 | 4;

const steps: { id: BuilderStep; label: string }[] = [
  { id: 0, label: "Theme" },
  { id: 1, label: "Screens" },
  { id: 2, label: "Configure" },
  { id: 3, label: "Note" },
  { id: 4, label: "Generate" }
];

function CreateGiftInner({ slug }: { slug: string }) {
  const router = useRouter();
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
  const [linkCopied, setLinkCopied] = useState(false);

  const config: GiftConfig = useMemo(
    () => ({ theme, screens, note }),
    [theme, screens, note]
  );

  const configValidation = useMemo(
    () => giftConfigSchema.safeParse(config),
    [config]
  );

  /** Validate only screens (placeholder note) — used on Configure step. */
  const screensValidation = useMemo(
    () => giftConfigSchema.safeParse(configWithPlaceholderNote(config)),
    [config]
  );

  const isConfigValid = configValidation.success;
  const isScreensValid = screensValidation.success;

  const configErrors = useMemo(() => {
    if (configValidation.success) return [];
    return formatConfigErrors(config, configValidation.error);
  }, [config, configValidation.success, configValidation.error]);

  const screensErrors = useMemo(() => {
    if (screensValidation.success) return [];
    return formatConfigErrors(config, screensValidation.error);
  }, [config, screensValidation.success, screensValidation.error]);

  const isNoteValid = note.body.trim().length > 0;
  const noteError = !isNoteValid && (step === 3 || step === 4)
    ? "Please write a note for your recipient."
    : null;

  const canGoNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return screens.length >= 1 && screens.length <= 3;
    if (step === 2) return screens.length >= 1 && isScreensValid;
    if (step === 3) return false; // no "Next" on note step; only Generate link
    return true;
  }, [step, screens.length, isScreensValid]);

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col px-4 sm:px-6 py-4 sm:py-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
        <header className="mb-6">
          <h1 className="text-2xl font-serif font-bold text-rose-600">
            Create your gift
          </h1>
          <p className="text-sm text-rose-400 mt-1">
            Choose up to three screens, customize them, then share a magic
            link.
          </p>
        </header>

        <nav className="flex items-center gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-1 scrollbar-hide touch-pan-x">
          {steps.map((s, index) => {
            const isActive = s.id === step;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={s.id > step}
                  onClick={() => setStep(s.id)}
                  className={`flex items-center gap-2 rounded-full px-3 py-2 sm:py-1.5 text-xs border shrink-0 min-h-[36px] ${
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

        <section className="rounded-2xl bg-white shadow-sm border border-rose-100 p-4 sm:p-6 mb-4 sm:mb-6 flex-1 min-h-0">
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
                      className="flex-1 min-h-[44px] rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
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
                      className="flex-1 min-h-[44px] rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
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
              <p className="text-sm text-rose-400">
                Fill in each screen below. You must complete all required fields before continuing.
              </p>
              {screensErrors.length > 0 && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4"
                >
                  <p className="font-semibold text-rose-700 mb-2">
                    Please fix the following before continuing:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-rose-700">
                    {screensErrors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                This is the last screen your recipient will see. Write your note below. Generate link will be enabled once the note is complete and all previous steps are valid.
              </p>

              {(noteError || configErrors.length > 0 || validationError) && (
                <div
                  role="alert"
                  className="rounded-xl border-2 border-rose-300 bg-rose-50 p-4"
                >
                  <p className="font-semibold text-rose-700 mb-2">
                    Please fix the following before generating your link:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-rose-700">
                    {noteError && <li key="note">{noteError}</li>}
                    {validationError && <li key="save">{validationError}</li>}
                    {configErrors
                      .filter((e) => !e.startsWith("Note —"))
                      .map((msg, i) => (
                        <li key={`config-${i}`}>{msg}</li>
                      ))}
                  </ul>
                </div>
              )}

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
                    className="w-full min-h-[44px] rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-rose-500">
                    Message <span className="text-rose-400 font-normal">(required)</span>
                  </label>
                  <textarea
                    value={note.body}
                    onChange={(e) =>
                      setNote((n) => ({ ...n, body: e.target.value }))
                    }
                    rows={6}
                    placeholder="Write from the heart..."
                    className={`w-full min-h-[120px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 ${
                      !isNoteValid && note.body.length === 0
                        ? "border-rose-300 bg-rose-50/50"
                        : "border-rose-100"
                    }`}
                  />
                  {!isNoteValid && (
                    <p className="text-xs text-rose-600">
                      Add at least one character to your note.
                    </p>
                  )}
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
                    className="w-full min-h-[44px] rounded-lg border border-rose-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  />
                </div>
              </div>
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
                    Gift saved! Share this link with your recipient:
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
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2500);
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

        <div className="flex items-center justify-between gap-3 flex-wrap">
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
            {step < 3 && (
              <Button
                type="button"
                size="sm"
                onClick={goNext}
                disabled={!canGoNext}
              >
                Next
              </Button>
            )}
            {step === 3 && (
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={
                  saving ||
                  screens.length === 0 ||
                  !isNoteValid ||
                  !isConfigValid
                }
              >
                {saving ? "Saving…" : "Generate link"}
              </Button>
            )}
            {step === 4 && savedSlug && (
              <Button
                type="button"
                size="sm"
                onClick={() => router.push("/")}
              >
                Restart / Go home
              </Button>
            )}
          </div>
        </div>
      </div>

      {linkCopied && (
        <div
          className="fixed bottom-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom)))] left-4 right-4 sm:left-1/2 sm:right-auto sm:w-auto sm:max-w-xs z-50 sm:-translate-x-1/2 rounded-full bg-rose-600 px-5 py-3 text-sm font-medium text-white shadow-lg text-center"
          role="status"
          aria-live="polite"
        >
          Link copied to clipboard
        </div>
      )}
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


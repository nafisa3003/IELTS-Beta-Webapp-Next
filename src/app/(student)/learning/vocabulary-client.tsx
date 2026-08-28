"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { VocabWord, CustomCard, VocabDifficulty } from "@/types/vocab";
import {
  createCustomCardAction,
  updateCustomCardAction,
  deleteCustomCardAction,
  toggleSaveWordAction,
} from "./actions";

type Tab = "bank" | "custom";
type DifficultyFilter = "all" | VocabDifficulty;

const DIFFICULTY_STYLES: Record<VocabDifficulty, { dot: string; badge: string }> = {
  easy: { dot: "bg-success", badge: "bg-success-soft text-success" },
  medium: { dot: "bg-warning", badge: "bg-warning-soft text-warning" },
  hard: { dot: "bg-danger", badge: "bg-danger-soft text-danger" },
};

function DifficultyDot({ level }: { level: VocabDifficulty }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${DIFFICULTY_STYLES[level].dot}`} />;
}

function DifficultyBadge({ level }: { level: VocabDifficulty }) {
  return (
    <span className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${DIFFICULTY_STYLES[level].badge}`}>
      {level}
    </span>
  );
}

export function VocabularyClient({
  allWords,
  savedWordIds,
  customCards,
}: {
  allWords: VocabWord[];
  savedWordIds: string[];
  customCards: CustomCard[];
}) {
  const [tab, setTab] = useState<Tab>("bank");
  const [, startTransition] = useTransition();

  // ---- Word bank state ----
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set(savedWordIds));

  const filteredWords = useMemo(() => {
    return allWords.filter((w) => {
      const matchesQuery = w.word.toLowerCase().includes(query.trim().toLowerCase());
      const matchesDifficulty = difficulty === "all" || w.difficulty === difficulty;
      return matchesQuery && matchesDifficulty;
    });
  }, [allWords, query, difficulty]);

  const activeWord = filteredWords[Math.min(activeIndex, filteredWords.length - 1)];

  function selectWord(index: number) {
    setActiveIndex(index);
    setFlipped(false);
  }

  function step(delta: number) {
    if (filteredWords.length === 0) return;
    setActiveIndex((i) => (i + delta + filteredWords.length) % filteredWords.length);
    setFlipped(false);
  }

  function toggleSave(word: VocabWord) {
    const isSaved = savedIds.has(word.wordid);
    setSavedIds((prev) => {
      const next = new Set(prev);
      isSaved ? next.delete(word.wordid) : next.add(word.wordid);
      return next;
    });
    startTransition(() => {
      toggleSaveWordAction(word.wordid, isSaved);
    });
  }

  // ---- Custom cards state ----
  const [editingCard, setEditingCard] = useState<CustomCard | null>(null);
  const [previewCard, setPreviewCard] = useState<CustomCard | null>(null);
  const [customFlipped, setCustomFlipped] = useState(false);
  const [form, setForm] = useState({ front: "", back: "", example: "", difficulty: "medium" });

  function resetForm() {
    setEditingCard(null);
    setForm({ front: "", back: "", example: "", difficulty: "medium" });
  }

  function startEdit(card: CustomCard) {
    setEditingCard(card);
    setPreviewCard(card);
    setCustomFlipped(false);
    setForm({
      front: card.front,
      back: card.back,
      example: card.example ?? "",
      difficulty: card.difficulty ?? "medium",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("front", form.front);
    fd.set("back", form.back);
    fd.set("example", form.example);
    fd.set("difficulty", form.difficulty);

    startTransition(() => {
      if (editingCard) {
        updateCustomCardAction(editingCard.cardid, fd);
      } else {
        createCustomCardAction(fd);
      }
    });
    resetForm();
  }

  function handleDelete(cardid: string) {
    startTransition(() => {
      deleteCustomCardAction(cardid);
    });
    if (previewCard?.cardid === cardid) setPreviewCard(null);
    if (editingCard?.cardid === cardid) resetForm();
  }

  const livePreview: CustomCard = previewCard ?? {
    cardid: "preview",
    userid: "",
    front: form.front || "Your term",
    back: form.back || "Its meaning",
    example: form.example || null,
    difficulty: (form.difficulty as VocabDifficulty) || null,
    created_at: "",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Section tabs — matches the Lessons/Vocabulary pill pattern already on the page */}
      <div className="inline-flex w-fit gap-1 rounded-pill bg-mist p-1">
        {(["bank", "custom"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-pill px-4 py-2 text-sm font-semibold transition ${
              tab === t ? "bg-surface text-teal shadow-card" : "text-slate-soft hover:text-slate"
            }`}
          >
            {t === "bank" ? "Study & Word Bank" : "My Custom Cards"}
          </button>
        ))}
      </div>

      {tab === "bank" ? (
        <div className="flex flex-col gap-6">
          {/* Saved words strip */}
          <section className="rounded-lg bg-surface p-6 shadow-card">
            <h2 className="mb-3 font-display text-lg font-semibold text-ink">Saved words</h2>
            {savedIds.size === 0 ? (
              <p className="text-sm text-slate-soft">Tap the bookmark on a flipped card to save it here.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allWords
                  .filter((w) => savedIds.has(w.wordid))
                  .map((w) => (
                    <span
                      key={w.wordid}
                      className="flex items-center gap-1.5 rounded-pill border border-mist bg-paper px-3 py-1.5 text-xs font-medium text-ink"
                    >
                      {w.word}
                      <button
                        onClick={() => toggleSave(w)}
                        className="text-slate-soft hover:text-danger"
                        aria-label={`Unsave ${w.word}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </section>

          {/* Word bank study card */}
          <section className="rounded-lg bg-surface p-6 shadow-card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-ink">IELTS Word Bank</h2>
                <p className="text-xs text-slate-soft">
                  Study {allWords.length} academic words and manage your own list
                </p>
              </div>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                  setFlipped(false);
                }}
                placeholder="Search words..."
                className="w-48 rounded-pill border border-mist px-3 py-1.5 text-sm outline-none focus:border-teal"
              />
            </div>

            <div className="mb-6 flex justify-center gap-2">
              {(["all", "easy", "medium", "hard"] as DifficultyFilter[]).map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDifficulty(d);
                    setActiveIndex(0);
                    setFlipped(false);
                  }}
                  className={`rounded-pill px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                    difficulty === d
                      ? "bg-teal text-white"
                      : "border border-mist text-slate-soft hover:border-teal hover:text-teal"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {!activeWord ? (
              <p className="py-12 text-center text-sm text-slate-soft">No words match your search.</p>
            ) : (
              <>
                <div className="mx-auto flex max-w-xl items-center gap-4">
                  <button
                    onClick={() => step(-1)}
                    className="rounded-full border border-mist p-2 text-slate-soft hover:border-teal hover:text-teal"
                    aria-label="Previous word"
                  >
                    ←
                  </button>

                  <div className="relative h-56 flex-1 [perspective:1200px]">
                    <motion.div
                      className="absolute inset-0 cursor-pointer rounded-lg shadow-float"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: flipped ? 180 : 0 }}
                      transition={{ duration: 0.45 }}
                      onClick={() => setFlipped((f) => !f)}
                    >
                      {/* Front */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-mist bg-cyan-light [backface-visibility:hidden]"
                      >
                        <DifficultyBadge level={activeWord.difficulty} />
                        <p className="font-display text-3xl font-bold text-navy">{activeWord.word}</p>
                        <p className="text-xs text-slate-soft">Click to reveal</p>
                      </div>

                      {/* Back */}
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-navy-deep px-8 text-center text-white [backface-visibility:hidden]"
                        style={{ transform: "rotateY(180deg)" }}
                      >
                        <p className="text-lg font-semibold">{activeWord.definition}</p>
                        {activeWord.example && (
                          <p className="text-sm italic text-white/80">"{activeWord.example}"</p>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(activeWord);
                          }}
                          className={`mt-1 rounded-pill px-4 py-1.5 text-xs font-semibold transition ${
                            savedIds.has(activeWord.wordid)
                              ? "bg-cyan text-navy-deep"
                              : "bg-white/15 text-white hover:bg-white/25"
                          }`}
                        >
                          {savedIds.has(activeWord.wordid) ? "Saved ✓" : "Save word"}
                        </button>
                      </div>
                    </motion.div>
                  </div>

                  <button
                    onClick={() => step(1)}
                    className="rounded-full border border-mist p-2 text-slate-soft hover:border-teal hover:text-teal"
                    aria-label="Next word"
                  >
                    →
                  </button>
                </div>

                {/* Word grid */}
                <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                  {filteredWords.map((w, i) => (
                    <button
                      key={w.wordid}
                      onClick={() => selectWord(i)}
                      className={`flex items-center justify-between gap-2 rounded-pill border px-3 py-2 text-xs font-medium transition ${
                        w.wordid === activeWord.wordid
                          ? "border-teal bg-teal-deep text-white"
                          : "border-mist text-ink hover:border-teal"
                      }`}
                    >
                      {w.word}
                      <DifficultyDot level={w.difficulty} />
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            {/* Create / edit form */}
            <div className="rounded-lg bg-surface p-6 shadow-card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {editingCard ? "Edit Custom Card" : "Create Custom Card"}
                </h2>
                {editingCard && (
                  <button onClick={resetForm} className="text-xs font-medium text-slate-soft hover:text-danger">
                    Cancel
                  </button>
                )}
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-soft">
                    Word
                  </label>
                  <input
                    required
                    value={form.front}
                    onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))}
                    placeholder="e.g. Ubiquitous"
                    className="w-full rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-soft">
                    Definition
                  </label>
                  <input
                    required
                    value={form.back}
                    onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))}
                    placeholder="Definition..."
                    className="w-full rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-soft">
                    Example sentence (optional)
                  </label>
                  <input
                    value={form.example}
                    onChange={(e) => setForm((f) => ({ ...f, example: e.target.value }))}
                    placeholder="Use the word in a sentence..."
                    className="w-full rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-soft">
                    Difficulty (optional)
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                    className="w-full rounded-md border border-mist px-3 py-2 text-sm outline-none focus:border-teal"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="rounded-pill bg-teal px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {editingCard ? "Save changes" : "Save Flashcard"}
                </button>
              </form>
            </div>

            {/* Live preview / flip card */}
            <div className="flex flex-col items-center justify-center rounded-lg bg-surface p-6 shadow-card">
              <div className="relative h-64 w-full max-w-sm [perspective:1200px]">
                <motion.div
                  className="absolute inset-0 cursor-pointer rounded-lg shadow-float"
                  style={{ transformStyle: "preserve-3d" }}
                  animate={{ rotateY: customFlipped ? 180 : 0 }}
                  transition={{ duration: 0.45 }}
                  onClick={() => setCustomFlipped((f) => !f)}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg border border-mist bg-cyan-light px-6 text-center [backface-visibility:hidden]">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-teal-deep">
                      Custom card
                    </span>
                    <p className="font-display text-2xl font-bold text-navy">{livePreview.front}</p>
                    <p className="text-xs text-slate-soft">Click to flip</p>
                  </div>
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg bg-navy-deep px-6 text-center text-white [backface-visibility:hidden]"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <p className="text-base font-semibold">{livePreview.back}</p>
                    {livePreview.example && <p className="text-sm italic text-white/80">"{livePreview.example}"</p>}
                    {previewCard && (
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(previewCard);
                          }}
                          className="rounded-pill bg-white/90 px-4 py-1.5 text-xs font-semibold text-ink hover:bg-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(previewCard.cardid);
                          }}
                          className="rounded-pill bg-danger px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Personal words grid */}
          <section className="rounded-lg bg-surface p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg font-semibold text-ink">My Personal Words</h2>
            {customCards.length === 0 ? (
              <p className="text-sm text-slate-soft">No custom flashcards yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {customCards.map((c) => (
                  <button
                    key={c.cardid}
                    onClick={() => {
                      setPreviewCard(c);
                      setCustomFlipped(false);
                    }}
                    className={`flex items-center justify-between gap-2 rounded-pill border px-3 py-2 text-xs font-medium transition ${
                      previewCard?.cardid === c.cardid
                        ? "border-teal bg-teal-deep text-white"
                        : "border-mist text-ink hover:border-teal"
                    }`}
                  >
                    {c.front}
                    {c.difficulty && <DifficultyDot level={c.difficulty} />}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

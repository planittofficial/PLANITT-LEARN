"use client";

import { useEffect, useState } from "react";
import { StickyNote } from "lucide-react";

import { getLessonNote, saveLessonNote } from "@/lib/learning/notes";
import { syncAchievements } from "@/lib/learning/achievements";

type LessonNotesProps = {
  userId: string;
  lessonId: string;
  embedded?: boolean;
};

export function LessonNotes({ userId, lessonId, embedded = false }: LessonNotesProps) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNote(getLessonNote(userId, lessonId));
  }, [userId, lessonId]);

  function handleBlur() {
    saveLessonNote(userId, lessonId, note);
    if (note.trim()) syncAchievements(userId);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className={embedded ? "" : "rounded-lg border border-borderSubtle bg-surface p-4 shadow-card"}>
      {!embedded ? (
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-textMuted">
            <StickyNote className="h-3.5 w-3.5" />
            My notes
          </p>
          {saved ? <span className="text-[10px] text-brand">Saved</span> : null}
        </div>
      ) : saved ? (
        <p className="mb-2 text-right text-[10px] text-brand">Saved</p>
      ) : null}
      <textarea
        className="w-full resize-none rounded-lg border border-borderSubtle bg-elevated px-4 py-3 text-sm leading-7 text-textPrimary placeholder:text-textMuted focus:border-brand/40 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-brand/10"
        rows={embedded ? 8 : 5}
        placeholder="Jot down key takeaways from this lesson…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleBlur}
      />
    </div>
  );
}

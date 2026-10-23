import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gradeAnswers } from "@/lib/grading";

/**
 * Submit an attempt: grading happens server-side from the question keys —
 * the client never decides the score.
 */
export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { examId: string; answers: Record<string, string> }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: questions, error } = await supabase
      .from("questions")
      .select("id, correct_option")
      .eq("exam_id", data.examId);
    if (error) throw new Error("Gagal memuat kunci jawaban.");
    if (!questions || questions.length === 0) throw new Error("Soal ujian tidak ditemukan.");

    const correct: Record<string, string> = {};
    for (const q of questions) correct[q.id] = q.correct_option;

    const { score, total } = gradeAnswers(data.answers, correct);

    const { data: attempt, error: insertError } = await supabase
      .from("attempts")
      .insert({
        exam_id: data.examId,
        user_id: userId,
        answers: data.answers,
        score,
        total,
      })
      .select("id")
      .single();
    if (insertError) throw new Error("Gagal menyimpan hasil ujian.");

    return { attemptId: attempt.id, score, total };
  });

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  nama: string;
  username: string;
  score: number;
  total: number;
  submitted_at: string;
};

/** Best attempt per user for one exam, ranked. */
export const getLeaderboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { examId: string }) => input)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: rows, error } = await supabase
      .from("attempts")
      .select("user_id, score, total, submitted_at, profiles(nama, username)")
      .eq("exam_id", data.examId);
    if (error) throw new Error("Gagal memuat leaderboard.");

    type Row = {
      user_id: string;
      score: number;
      total: number;
      submitted_at: string;
      profiles: { nama: string; username: string } | { nama: string; username: string }[] | null;
    };

    const best = new Map<
      string,
      Omit<LeaderboardEntry, "rank">
    >();
    for (const raw of (rows ?? []) as Row[]) {
      const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
      const entry = {
        user_id: raw.user_id,
        nama: p?.nama ?? "",
        username: p?.username ?? "",
        score: raw.score,
        total: raw.total,
        submitted_at: raw.submitted_at,
      };
      const prev = best.get(raw.user_id);
      if (
        !prev ||
        entry.score > prev.score ||
        (entry.score === prev.score && entry.submitted_at < prev.submitted_at)
      ) {
        best.set(raw.user_id, entry);
      }
    }

    const sorted = [...best.values()].sort(
      (a, b) => b.score - a.score || a.submitted_at.localeCompare(b.submitted_at),
    );
    const leaderboard: LeaderboardEntry[] = sorted.map((entry, i) => ({
      rank: i + 1,
      ...entry,
    }));

    return {
      leaderboard,
      myRank: leaderboard.find((e) => e.user_id === userId) ?? null,
    };
  });

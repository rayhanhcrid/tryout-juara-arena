import { supabase } from "@/integrations/supabase/client";
import { newGuestKey, reusableGuest, saveGuest, type Guest } from "@/lib/exam-session";
import { isBundledImage } from "@/lib/question-format";
import { isQuestionKind, type Answer, type QuestionKind } from "@/lib/question-kinds";

/**
 * Everything a participant does, through database functions callable with
 * the publishable key (see drizzle/migrations/0001_public_guest_access.sql).
 * No server secret is involved, so this works on Lovable, Vercel and locally;
 * answer keys stay in the database, which also does the grading.
 */

export type CatalogEntry = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questionCount: number;
  attemptCount: number;
  myBest: { score: number; total: number } | null;
};

export type TakingExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
};

export type TakingQuestion = {
  id: string;
  kind: QuestionKind;
  text: string;
  imageUrl: string | null;
  /** Answer options, or the statements of a category question. */
  options: string[];
  categories: string[] | null;
};

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  nama: string;
  score: number;
  total: number;
  submitted_at: string;
};

export type MyAttempt = { id: string; score: number; total: number; submitted_at: string };

type GuestCred = Pick<Guest, "id" | "key">;

function guestArgs(guest: GuestCred | null) {
  return guest ? { p_guest_id: guest.id, p_guest_key: guest.key } : {};
}

export async function fetchCatalog(guest: GuestCred | null): Promise<CatalogEntry[]> {
  const { data, error } = await supabase.rpc("get_catalog", guestArgs(guest));
  if (error) throw new Error("Gagal memuat katalog.");
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    duration_minutes: r.duration_minutes,
    questionCount: r.question_count,
    attemptCount: r.attempt_count,
    myBest:
      r.my_best_score !== null && r.my_best_total !== null
        ? { score: r.my_best_score, total: r.my_best_total }
        : null,
  }));
}

type ExamPayload = {
  exam: TakingExam;
  questions: (Omit<TakingQuestion, "imageUrl" | "kind"> & {
    kind: string;
    image_path: string | null;
  })[];
};

/** An exam with its questions (no answer keys); images pre-signed for the whole sitting. */
export async function fetchExamForTaking(
  examId: string,
): Promise<{ exam: TakingExam; questions: TakingQuestion[] } | null> {
  const { data, error } = await supabase.rpc("get_exam_for_taking", { p_exam_id: examId });
  if (error) throw new Error("Gagal memuat soal.");
  if (!data) return null;
  const payload = data as unknown as ExamPayload;

  const paths = payload.questions
    .map((q) => q.image_path)
    .filter((p): p is string => !!p && !isBundledImage(p));
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const ttl = (payload.exam.duration_minutes + 60) * 60;
    const { data: signed } = await supabase.storage
      .from("exam-images")
      .createSignedUrls(paths, ttl);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }

  return {
    exam: payload.exam,
    questions: payload.questions.map((q) => ({
      id: q.id,
      kind: isQuestionKind(q.kind) ? q.kind : "single",
      text: q.text,
      options: q.options,
      categories: q.categories,
      imageUrl: !q.image_path
        ? null
        : isBundledImage(q.image_path)
          ? q.image_path
          : (urls.get(q.image_path) ?? null),
    })),
  };
}

/**
 * Send answers under a name. The database grades them and returns the guest
 * it recorded the attempt under, which this browser keeps for next time.
 */
export async function submitAsGuest(
  examId: string,
  answers: Record<string, Answer>,
  nama: string,
): Promise<{ score: number; total: number; nama: string }> {
  const reuse = reusableGuest(nama);
  const key = reuse?.key ?? newGuestKey();
  const { data, error } = await supabase.rpc("submit_attempt", {
    p_exam_id: examId,
    p_answers: answers,
    p_nama: nama,
    p_guest_key: key,
    ...(reuse ? { p_guest_id: reuse.id } : {}),
  });
  if (error) {
    // Validation errors raised by the function are already written for people.
    const readable = error.code === "22023" || error.code === "P0002";
    throw new Error(readable ? error.message : "Gagal mengirim jawaban.");
  }
  const row = data?.[0];
  if (!row) throw new Error("Gagal mengirim jawaban.");
  saveGuest({ id: row.guest_id, key, nama: row.nama });
  return { score: row.score, total: row.total, nama: row.nama };
}

export type Results = {
  exam: { id: string; title: string; duration_minutes: number; questionCount: number } | null;
  leaderboard: LeaderboardEntry[];
  myAttempts: MyAttempt[];
  meId: string | null;
};

/** One catalog's board, plus this browser's own attempts at it. */
export async function fetchResults(examId: string, guest: GuestCred | null): Promise<Results> {
  const [examRes, boardRes, mineRes] = await Promise.all([
    supabase.rpc("get_exam_for_taking", { p_exam_id: examId }),
    supabase.rpc("get_leaderboard", { p_exam_id: examId }),
    guest
      ? supabase.rpc("get_my_attempts", {
          p_exam_id: examId,
          p_guest_id: guest.id,
          p_guest_key: guest.key,
        })
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (examRes.error || boardRes.error || mineRes.error) {
    throw new Error("Gagal memuat peringkat.");
  }
  const payload = examRes.data as unknown as ExamPayload | null;
  if (!payload) return { exam: null, leaderboard: [], myAttempts: [], meId: null };

  return {
    exam: {
      id: payload.exam.id,
      title: payload.exam.title,
      duration_minutes: payload.exam.duration_minutes,
      questionCount: payload.questions.length,
    },
    leaderboard: (boardRes.data ?? []).map((r) => ({
      rank: r.rank,
      user_id: r.participant_id,
      nama: r.nama,
      score: r.score,
      total: r.total,
      submitted_at: r.submitted_at,
    })),
    myAttempts: mineRes.data ?? [],
    meId: guest?.id ?? null,
  };
}

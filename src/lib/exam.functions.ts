import { createServerFn } from "@tanstack/react-start";
import { gradeAnswers } from "@/lib/grading";

/**
 * Public exam functions. Participants have no account, so every read and
 * write goes through the service-role client on the server: the browser
 * never receives answer keys, and grading happens here, not on the client.
 */

async function db() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
type Db = Awaited<ReturnType<typeof db>>;

async function guestIdFrom(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const { verifyGuestToken } = await import("@/server/guest-auth");
  return verifyGuestToken(token);
}

const NAME_MIN = 2;
const NAME_MAX = 40;

export function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, NAME_MAX);
}

/* ---------------- Catalog ---------------- */

export type CatalogEntry = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questionCount: number;
  attemptCount: number;
  myBest: { score: number; total: number } | null;
};

export const getCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: { guestToken: string | null }) => input)
  .handler(async ({ data }) => {
    const admin = await db();
    const { data: rows, error } = await admin
      .from("exams")
      .select("id, title, description, duration_minutes, questions(count), attempts(count)")
      .order("created_at", { ascending: true });
    if (error) throw new Error("Gagal memuat katalog.");

    const best = new Map<string, { score: number; total: number }>();
    const guestId = await guestIdFrom(data.guestToken);
    if (guestId) {
      const { data: mine } = await admin
        .from("attempts")
        .select("exam_id, score, total")
        .eq("user_id", guestId);
      for (const a of mine ?? []) {
        const prev = best.get(a.exam_id);
        if (!prev || a.score > prev.score) best.set(a.exam_id, { score: a.score, total: a.total });
      }
    }

    const exams: CatalogEntry[] = (rows ?? []).map((r) => {
      const counted = r as { questions?: { count: number }[]; attempts?: { count: number }[] };
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        duration_minutes: r.duration_minutes,
        questionCount: counted.questions?.[0]?.count ?? 0,
        attemptCount: counted.attempts?.[0]?.count ?? 0,
        myBest: best.get(r.id) ?? null,
      };
    });
    return { exams };
  });

/* ---------------- Taking an exam ---------------- */

export type TakingQuestion = {
  id: string;
  text: string;
  imageUrl: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

/** Questions without their answer keys; images come pre-signed for the whole sitting. */
export const getExamForTaking = createServerFn({ method: "GET" })
  .inputValidator((input: { examId: string }) => input)
  .handler(async ({ data }) => {
    const admin = await db();
    const [{ data: exam }, { data: rows, error }] = await Promise.all([
      admin
        .from("exams")
        .select("id, title, description, duration_minutes")
        .eq("id", data.examId)
        .maybeSingle(),
      admin
        .from("questions")
        .select("id, text, image_path, option_a, option_b, option_c, option_d")
        .eq("exam_id", data.examId)
        .order("order_index", { ascending: true }),
    ]);
    if (error) throw new Error("Gagal memuat soal.");
    if (!exam) return { exam: null, questions: [] as TakingQuestion[] };

    const paths = (rows ?? []).map((q) => q.image_path).filter((p): p is string => !!p);
    const urls = new Map<string, string>();
    if (paths.length > 0) {
      const ttl = (exam.duration_minutes + 60) * 60;
      const { data: signed } = await admin.storage.from("exam-images").createSignedUrls(paths, ttl);
      for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
    }

    const questions: TakingQuestion[] = (rows ?? []).map((q) => ({
      id: q.id,
      text: q.text,
      imageUrl: q.image_path ? (urls.get(q.image_path) ?? null) : null,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
    }));
    return { exam, questions };
  });

/* ---------------- Submitting ---------------- */

async function createGuest(admin: Db, nama: string): Promise<string> {
  const short = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const username = `tamu-${short}`;
  const { data: created, error } = await admin.auth.admin.createUser({
    email: `${username}@guests.tryout.local`,
    email_confirm: true,
    user_metadata: { nama, username },
  });
  if (error || !created.user) throw new Error("Gagal menyiapkan peserta. Coba kirim lagi.");
  // The signup trigger normally creates the profile; make sure it exists either way.
  await admin
    .from("profiles")
    .upsert({ id: created.user.id, username, nama }, { onConflict: "id" });
  return created.user.id;
}

/**
 * Grade and record an attempt for a named guest. A valid guest token reuses
 * that guest (and refreshes their display name); otherwise a new guest is made.
 */
export const submitGuestAttempt = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      examId: string;
      answers: Record<string, string>;
      nama: string;
      guestToken: string | null;
    }) => input,
  )
  .handler(async ({ data }) => {
    const nama = cleanName(data.nama);
    if (nama.length < NAME_MIN) throw new Error("Tulis namamu dulu, minimal 2 huruf.");

    const admin = await db();
    const { data: questions, error } = await admin
      .from("questions")
      .select("id, correct_option")
      .eq("exam_id", data.examId);
    if (error) throw new Error("Gagal memuat kunci jawaban.");
    if (!questions || questions.length === 0) throw new Error("Soal ujian tidak ditemukan.");

    // Keep only answers to this exam's questions, and only A–D.
    const known = new Set(questions.map((q) => q.id));
    const answers: Record<string, string> = {};
    for (const [id, letter] of Object.entries(data.answers ?? {})) {
      if (known.has(id) && ["a", "b", "c", "d"].includes(letter)) answers[id] = letter;
    }
    const correct: Record<string, string> = {};
    for (const q of questions) correct[q.id] = q.correct_option;
    const { score, total } = gradeAnswers(answers, correct);

    let guestId = await guestIdFrom(data.guestToken);
    if (guestId) {
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("id", guestId)
        .maybeSingle();
      if (profile) await admin.from("profiles").update({ nama }).eq("id", guestId);
      else guestId = null;
    }
    if (!guestId) guestId = await createGuest(admin, nama);

    const { data: attempt, error: insertError } = await admin
      .from("attempts")
      .insert({ exam_id: data.examId, user_id: guestId, answers, score, total })
      .select("id")
      .single();
    if (insertError || !attempt) throw new Error("Gagal menyimpan hasil ujian.");

    const { signGuestToken } = await import("@/server/guest-auth");
    return { attemptId: attempt.id, score, total, nama, guestToken: await signGuestToken(guestId) };
  });

/* ---------------- Results & leaderboard ---------------- */

export type LeaderboardEntry = {
  rank: number;
  user_id: string;
  nama: string;
  score: number;
  total: number;
  submitted_at: string;
};

export type MyAttempt = { id: string; score: number; total: number; submitted_at: string };

/** Best attempt per participant, ranked; ties go to whoever submitted first. */
export const getResults = createServerFn({ method: "GET" })
  .inputValidator((input: { examId: string; guestToken: string | null }) => input)
  .handler(async ({ data }) => {
    const admin = await db();
    const [{ data: exam }, { data: rows, error }] = await Promise.all([
      admin
        .from("exams")
        .select("id, title, duration_minutes, questions(count)")
        .eq("id", data.examId)
        .maybeSingle(),
      admin
        .from("attempts")
        .select("id, user_id, score, total, submitted_at, profiles(nama, username)")
        .eq("exam_id", data.examId),
    ]);
    if (error) throw new Error("Gagal memuat peringkat.");
    if (!exam) return { exam: null, leaderboard: [], myAttempts: [], meId: null };

    type Row = {
      id: string;
      user_id: string;
      score: number;
      total: number;
      submitted_at: string;
      profiles: { nama: string; username: string } | { nama: string; username: string }[] | null;
    };

    const best = new Map<string, Omit<LeaderboardEntry, "rank">>();
    for (const raw of (rows ?? []) as Row[]) {
      const p = Array.isArray(raw.profiles) ? raw.profiles[0] : raw.profiles;
      const entry = {
        user_id: raw.user_id,
        nama: p?.nama || "Peserta",
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
    const leaderboard: LeaderboardEntry[] = [...best.values()]
      .sort((a, b) => b.score - a.score || a.submitted_at.localeCompare(b.submitted_at))
      .map((entry, i) => ({ rank: i + 1, ...entry }));

    const meId = await guestIdFrom(data.guestToken);
    const myAttempts: MyAttempt[] = meId
      ? ((rows ?? []) as Row[])
          .filter((r) => r.user_id === meId)
          .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
          .map((r) => ({ id: r.id, score: r.score, total: r.total, submitted_at: r.submitted_at }))
      : [];

    const counted = exam as { questions?: { count: number }[] };
    return {
      exam: {
        id: exam.id,
        title: exam.title,
        duration_minutes: exam.duration_minutes,
        questionCount: counted.questions?.[0]?.count ?? 0,
      },
      leaderboard,
      myAttempts,
      meId,
    };
  });

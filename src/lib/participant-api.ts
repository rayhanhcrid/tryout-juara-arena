import { supabase } from "@/integrations/supabase/client";
import {
  forgetGuest,
  newGuestKey,
  readGuest,
  reusableGuest,
  saveGuest,
  type Guest,
} from "@/lib/exam-session";
import { isBundledImage } from "@/lib/question-format";
import {
  isQuestionKind,
  type Answer,
  type AnswerKey,
  type QuestionKind,
} from "@/lib/question-kinds";
import { toTrack, type Track } from "@/lib/tracks";

/**
 * Everything a participant does, through database functions callable with
 * the publishable key (see drizzle/migrations/0001_public_guest_access.sql,
 * 0006_lulustes_daily.sql and 0007_akun_profil.sql). No server secret is involved, so this works
 * on Lovable, Vercel and locally; answer keys stay in the database, which
 * also does the grading, and only come back for the guest's own attempts.
 */

export type CatalogEntry = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  track: Track;
  /** "YYYY-MM-DD" for a daily package; null for a regular one. */
  dailyDate: string | null;
  questionCount: number;
  attemptCount: number;
  myBest: { score: number; total: number } | null;
};

export type TakingExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  track: Track;
  dailyDate: string | null;
};

export type TakingQuestion = {
  id: string;
  kind: QuestionKind;
  text: string;
  imageUrl: string | null;
  /** Answer options, or the statements of a category question. */
  options: string[];
  categories: string[] | null;
  /** The subtes it belongs to (TWK, TIU…), when the admin named one. */
  section: string | null;
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
  if (error) throw new Error("Gagal memuat paket soal.");
  return (data ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    duration_minutes: r.duration_minutes,
    track: toTrack(r.track),
    dailyDate: r.daily_date ?? null,
    questionCount: r.question_count,
    attemptCount: r.attempt_count,
    myBest:
      r.my_best_score !== null && r.my_best_total !== null
        ? { score: r.my_best_score, total: r.my_best_total }
        : null,
  }));
}

type RawExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  track?: string;
  daily_date?: string | null;
};

type RawQuestion = {
  id: string;
  kind: string;
  text: string;
  image_path: string | null;
  options: string[];
  categories: string[] | null;
  section?: string | null;
};

type ExamPayload = { exam: RawExam; questions: RawQuestion[] };

function examFrom(raw: RawExam): TakingExam {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    duration_minutes: raw.duration_minutes,
    track: toTrack(raw.track),
    dailyDate: raw.daily_date ?? null,
  };
}

/** Signed links for stored question images; bundled ones are served as they are. */
async function imageUrls(
  questions: RawQuestion[],
  ttlSeconds: number,
): Promise<(q: RawQuestion) => string | null> {
  const paths = questions
    .map((q) => q.image_path)
    .filter((p): p is string => !!p && !isBundledImage(p));
  const urls = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("exam-images")
      .createSignedUrls(paths, ttlSeconds);
    for (const s of signed ?? []) if (s.path && s.signedUrl) urls.set(s.path, s.signedUrl);
  }
  return (q) =>
    !q.image_path
      ? null
      : isBundledImage(q.image_path)
        ? q.image_path
        : (urls.get(q.image_path) ?? null);
}

function questionFrom(q: RawQuestion, imageUrl: string | null): TakingQuestion {
  return {
    id: q.id,
    kind: isQuestionKind(q.kind) ? q.kind : "single",
    text: q.text,
    options: q.options,
    categories: q.categories,
    section: q.section?.trim() || null,
    imageUrl,
  };
}

/** An exam with its questions (no answer keys); images pre-signed for the whole sitting. */
export async function fetchExamForTaking(
  examId: string,
): Promise<{ exam: TakingExam; questions: TakingQuestion[] } | null> {
  const { data, error } = await supabase.rpc("get_exam_for_taking", { p_exam_id: examId });
  if (error) throw new Error("Gagal memuat soal.");
  if (!data) return null;
  const payload = data as unknown as ExamPayload;
  const urlOf = await imageUrls(payload.questions, (payload.exam.duration_minutes + 60) * 60);
  return {
    exam: examFrom(payload.exam),
    questions: payload.questions.map((q) => questionFrom(q, urlOf(q))),
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
): Promise<{ attemptId: string; score: number; total: number; nama: string }> {
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
  // A signed-in browser stays signed in to the same account.
  const username = reuse?.id === row.guest_id ? reuse.username : undefined;
  saveGuest({ id: row.guest_id, key, nama: row.nama, ...(username ? { username } : {}) });
  return { attemptId: row.attempt_id, score: row.score, total: row.total, nama: row.nama };
}

export type Results = {
  exam: (TakingExam & { questionCount: number }) | null;
  leaderboard: LeaderboardEntry[];
  myAttempts: MyAttempt[];
  meId: string | null;
};

/** One package's board (first attempts), plus this browser's own attempts at it. */
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
    exam: { ...examFrom(payload.exam), questionCount: payload.questions.length },
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

export type DailyDay = {
  date: string;
  /** A package with questions was scheduled that day. */
  package: boolean;
  /** This guest sent that day's package on that same day. */
  done: boolean;
};

export type DailyPackage = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  track: Track;
  questionCount: number;
  attemptCount: number;
};

export type Daily = {
  today: string;
  package: DailyPackage | null;
  /** The guest's first attempt at today's package, the one the board counts. */
  mine: { attemptId: string; score: number; total: number; submittedAt: string } | null;
  streak: { current: number; best: number };
  /** The last seven days, oldest first, ending today. */
  days: DailyDay[];
};

type DailyPayload = {
  today: string;
  package: {
    id: string;
    title: string;
    description: string;
    duration_minutes: number;
    track: string;
    question_count: number;
    attempt_count: number;
  } | null;
  mine: { attempt_id: string; score: number; total: number; submitted_at: string } | null;
  streak: { current: number; best: number };
  days: DailyDay[];
};

/** Today's package and, for a returning guest, their streak. */
export async function fetchDaily(guest: GuestCred | null): Promise<Daily> {
  const { data, error } = await supabase.rpc("get_daily", guestArgs(guest));
  if (error || !data) throw new Error("Gagal memuat paket hari ini.");
  const p = data as unknown as DailyPayload;
  return {
    today: p.today,
    package: p.package
      ? {
          id: p.package.id,
          title: p.package.title,
          description: p.package.description,
          duration_minutes: p.package.duration_minutes,
          track: toTrack(p.package.track),
          questionCount: p.package.question_count,
          attemptCount: p.package.attempt_count,
        }
      : null,
    mine: p.mine
      ? {
          attemptId: p.mine.attempt_id,
          score: p.mine.score,
          total: p.mine.total,
          submittedAt: p.mine.submitted_at,
        }
      : null,
    streak: p.streak ?? { current: 0, best: 0 },
    days: p.days ?? [],
  };
}

export type ReviewQuestion = TakingQuestion & {
  explanation: string;
  key: AnswerKey;
  /** What was sent, cleaned to fit the question; null when left empty. */
  given: Answer | null;
  correct: boolean;
};

export type AttemptReview = {
  attempt: {
    id: string;
    score: number;
    total: number;
    submittedAt: string;
    nama: string;
    /** 1 for the guest's first attempt at this package, the one the board counts. */
    number: number;
  };
  exam: TakingExam;
  questions: ReviewQuestion[];
};

type ReviewPayload = {
  attempt: {
    id: string;
    score: number;
    total: number;
    submitted_at: string;
    nama: string;
    number: number;
  };
  exam: RawExam;
  questions: (RawQuestion & {
    explanation: string | null;
    key: AnswerKey;
    given: Answer | null;
    correct: boolean;
  })[];
};

/** One of this browser's attempts with keys and explanations; null when it is not theirs. */
export async function fetchAttemptReview(
  attemptId: string,
  guest: GuestCred | null,
): Promise<AttemptReview | null> {
  if (!guest) return null;
  const { data, error } = await supabase.rpc("get_attempt_review", {
    p_attempt_id: attemptId,
    p_guest_id: guest.id,
    p_guest_key: guest.key,
  });
  if (error) throw new Error("Gagal memuat pembahasan.");
  if (!data) return null;
  const p = data as unknown as ReviewPayload;
  // Long enough to read the review and save it as a PDF.
  const urlOf = await imageUrls(p.questions, 6 * 60 * 60);
  return {
    attempt: {
      id: p.attempt.id,
      score: p.attempt.score,
      total: p.attempt.total,
      submittedAt: p.attempt.submitted_at,
      nama: p.attempt.nama,
      number: p.attempt.number,
    },
    exam: examFrom(p.exam),
    questions: p.questions.map((q) => ({
      ...questionFrom(q, urlOf(q)),
      explanation: q.explanation?.trim() ?? "",
      key: q.key,
      given: q.given ?? null,
      correct: q.correct === true,
    })),
  };
}

export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  sourceName: string;
  sourceUrl: string;
  track: Track;
  publishedOn: string;
};

export async function fetchNews(limit = 50): Promise<NewsItem[]> {
  const { data, error } = await supabase.rpc("get_news", { p_limit: limit });
  if (error) throw new Error("Gagal memuat berita.");
  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    summary: n.summary,
    sourceName: n.source_name,
    sourceUrl: n.source_url,
    track: toTrack(n.track),
    publishedOn: n.published_on,
  }));
}

// ---------- Accounts (optional) ----------

export type Account = { id: string; nama: string; username: string };

/**
 * The database does not have the account functions yet: PostgREST answers
 * PGRST202 ("function not found") until migration 0007 is applied.
 */
function isMissingFunction(error: { code?: string }): boolean {
  return error.code === "PGRST202" || error.code === "42883";
}

const ACCOUNTS_NOT_READY =
  "Fitur akun belum aktif di server: migrasi database 0007_akun_profil.sql belum dijalankan.";

/** Messages the account functions raise are already written for people. */
function accountError(error: { code?: string; message: string }, fallback: string): Error {
  if (isMissingFunction(error)) return new Error(ACCOUNTS_NOT_READY);
  const readable = ["22023", "23505", "28P01"].includes(error.code ?? "");
  return new Error(readable ? error.message : fallback);
}

/**
 * Create an account. A plain guest on this browser becomes the account, so
 * its history and streak come along; otherwise a new participant starts.
 */
export async function registerAccount(input: {
  username: string;
  password: string;
  nama: string;
}): Promise<Account> {
  const current = readGuest();
  const claim = current && !current.username ? current : null;
  const key = claim?.key ?? newGuestKey();
  const { data, error } = await supabase.rpc("register_account", {
    p_username: input.username,
    p_password: input.password,
    p_nama: input.nama,
    p_guest_key: key,
    ...(claim ? { p_guest_id: claim.id } : {}),
  });
  if (error) throw accountError(error, "Gagal membuat akun. Coba lagi sebentar lagi.");
  const row = data?.[0];
  if (!row) throw new Error("Gagal membuat akun. Coba lagi sebentar lagi.");
  saveGuest({ id: row.guest_id, key, nama: row.nama, username: row.username });
  return { id: row.guest_id, nama: row.nama, username: row.username };
}

/**
 * Sign in from this browser; it gets a key of its own. A plain guest on this
 * browser hands its attempts to the account, so a score just sent is kept.
 */
export async function signIn(username: string, password: string): Promise<Account> {
  const key = newGuestKey();
  const current = readGuest();
  const merge = current && !current.username ? current : null;
  const { data, error } = await supabase.rpc("login_account", {
    p_username: username,
    p_password: password,
    p_new_key: key,
    ...(merge ? { p_guest_id: merge.id, p_guest_key: merge.key } : {}),
  });
  if (error)
    throw accountError(error, "Tidak bisa masuk sekarang. Periksa koneksi, lalu coba lagi.");
  const row = data?.[0];
  if (!row) throw new Error("Tidak bisa masuk sekarang. Coba lagi sebentar lagi.");
  saveGuest({ id: row.guest_id, key, nama: row.nama, username: row.username });
  return { id: row.guest_id, nama: row.nama, username: row.username };
}

/** Sign this browser out. Forgetting locally is what matters; the server call is best effort. */
export async function signOut(): Promise<void> {
  const g = readGuest();
  forgetGuest();
  if (!g?.username) return;
  try {
    await supabase.rpc("logout_account", { p_guest_id: g.id, p_guest_key: g.key });
  } catch {
    // Offline: the key is gone from this browser anyway.
  }
}

// ---------- Profile ----------

export type ProfileDay = {
  /** The package's date, "YYYY-MM-DD". */
  date: string;
  examId: string;
  title: string;
  /** The first attempt at it, the one the board counts; null when not done. */
  attemptId: string | null;
  score: number | null;
  total: number | null;
  /** Sent on its own day (WIB), so it counts toward the streak. */
  onTime: boolean;
};

export type ProfileAttempt = {
  attemptId: string;
  examId: string;
  title: string;
  dailyDate: string | null;
  score: number;
  total: number;
  submittedAt: string;
};

export type Profile = {
  today: string;
  guest: { id: string; nama: string; username: string | null; joined: string };
  streak: { current: number; best: number };
  /** The last seven days, as on Hari ini. */
  week: DailyDay[];
  totals: {
    attempts: number;
    packages: number;
    /** Mean % of first attempts, or null before any. */
    average: number | null;
    best: number | null;
  };
  /** Package days, oldest first. */
  days: ProfileDay[];
  /** Latest attempts at any package, newest first. */
  recent: ProfileAttempt[];
};

type ProfilePayload = {
  today: string;
  guest: { id: string; nama: string; username: string | null; joined: string };
  streak: { current: number; best: number } | null;
  week: DailyDay[];
  totals: { attempts: number; packages: number; average: number | null; best: number | null };
  days: {
    date: string;
    exam_id: string;
    title: string;
    attempt_id: string | null;
    score: number | null;
    total: number | null;
    on_time: boolean;
  }[];
  recent: {
    attempt_id: string;
    exam_id: string;
    title: string;
    daily_date: string | null;
    score: number;
    total: number;
    submitted_at: string;
  }[];
};

/** This browser's participant dashboard; null when its key no longer checks out. */
export async function fetchProfile(guest: GuestCred): Promise<Profile | null> {
  const { data, error } = await supabase.rpc("get_profile", {
    p_guest_id: guest.id,
    p_guest_key: guest.key,
  });
  if (error)
    throw new Error(isMissingFunction(error) ? ACCOUNTS_NOT_READY : "Gagal memuat profil.");
  if (!data) return null;
  const p = data as unknown as ProfilePayload;
  return {
    today: p.today,
    guest: {
      id: p.guest.id,
      nama: p.guest.nama,
      username: p.guest.username ?? null,
      joined: p.guest.joined,
    },
    streak: p.streak ?? { current: 0, best: 0 },
    week: p.week ?? [],
    totals: p.totals ?? { attempts: 0, packages: 0, average: null, best: null },
    days: (p.days ?? []).map((d) => ({
      date: d.date,
      examId: d.exam_id,
      title: d.title,
      attemptId: d.attempt_id ?? null,
      score: d.score ?? null,
      total: d.total ?? null,
      onTime: d.on_time === true,
    })),
    recent: (p.recent ?? []).map((r) => ({
      attemptId: r.attempt_id,
      examId: r.exam_id,
      title: r.title,
      dailyDate: r.daily_date ?? null,
      score: r.score,
      total: r.total,
      submittedAt: r.submitted_at,
    })),
  };
}

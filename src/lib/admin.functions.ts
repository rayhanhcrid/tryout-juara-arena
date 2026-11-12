import { createServerFn } from "@tanstack/react-start";
import { isBundledImage } from "@/lib/question-format";
import {
  isQuestionKind,
  validateQuestion,
  type AnswerKey,
  type QuestionKind,
} from "@/lib/question-kinds";
import { isTrack, toTrack, type Track } from "@/lib/tracks";

/**
 * Admin server functions. Every call re-verifies the admin token
 * (HMAC-signed, issued by adminLogin) before touching privileged data via
 * the service-role client — the UI gate is convenience only.
 */

type AdminInput = { token: string };

async function assertAdmin(token: string | undefined) {
  const { verifyAdminToken } = await import("@/server/admin-auth");
  const ok = await verifyAdminToken(token);
  if (!ok) throw new Error("Sesi admin tidak valid. Masukkan kata sandi lagi.");
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

type AdminClient = Awaited<ReturnType<typeof adminClient>>;

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const { signingSecret } = await import("@/server/hmac");
    // Without the server key no token can be signed and no admin query can run
    // (e.g. a local `vite dev` without Lovable Cloud's secrets). Say so instead
    // of pretending the password was wrong.
    if (!signingSecret()) return { token: null, reason: "server" as const };
    const { createAdminToken } = await import("@/server/admin-auth");
    const token = await createAdminToken(data.code);
    if (!token) return { token: null, reason: "code" as const };
    return { token, reason: null };
  });

export const adminCheckToken = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput) => input)
  .handler(async ({ data }) => {
    const { verifyAdminToken } = await import("@/server/admin-auth");
    return { valid: await verifyAdminToken(data.token) };
  });

export type AdminExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  featured: boolean;
  track: Track;
  /** "YYYY-MM-DD" (WIB) when scheduled as that day's package. */
  daily_date: string | null;
  questionCount: number;
  attemptCount: number;
};

export const adminListExams = createServerFn({ method: "GET" })
  .inputValidator((input: AdminInput) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    // Same order participants see: pinned first, then newest package day, then oldest first.
    const { data: rows, error } = await admin
      .from("exams")
      .select(
        "id, title, description, duration_minutes, featured, track, daily_date, questions(count), attempts(count)",
      )
      .order("featured", { ascending: false })
      .order("daily_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (error) throw new Error("Gagal memuat daftar paket.");
    const exams: AdminExam[] = (rows ?? []).map((r) => {
      const counted = r as { questions?: { count: number }[]; attempts?: { count: number }[] };
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        duration_minutes: r.duration_minutes,
        featured: r.featured,
        track: toTrack(r.track),
        daily_date: r.daily_date,
        questionCount: counted.questions?.[0]?.count ?? 0,
        attemptCount: counted.attempts?.[0]?.count ?? 0,
      };
    });
    return { exams };
  });

type ExamFields = {
  title: string;
  description: string;
  duration_minutes: number;
  featured: boolean;
  track: Track;
  daily_date: string | null;
};

const DAY = /^\d{4}-\d{2}-\d{2}$/;

function validateExamFields(input: ExamFields) {
  const title = input.title.trim();
  if (!title) throw new Error("Judul paket tidak boleh kosong.");
  if (!Number.isFinite(input.duration_minutes) || input.duration_minutes <= 0) {
    throw new Error("Durasi harus lebih dari 0 menit.");
  }
  if (!isTrack(input.track)) throw new Error("Pilih jalur paket.");
  const day = input.daily_date?.trim() || null;
  if (day && (!DAY.test(day) || Number.isNaN(Date.parse(day)))) {
    throw new Error("Tanggal paket harian tidak valid.");
  }
  return {
    title,
    description: input.description.trim(),
    duration_minutes: Math.round(input.duration_minutes),
    featured: input.featured === true,
    track: input.track,
    daily_date: day,
  };
}

/** One package per day: say which rule was broken instead of a generic failure. */
function examSaveError(error: { code?: string } | null, fallback: string): Error {
  return new Error(
    error?.code === "23505" ? "Tanggal itu sudah dipakai paket harian lain." : fallback,
  );
}

export const adminCreateExam = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & ExamFields) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const fields = validateExamFields(data);
    const { data: exam, error } = await admin.from("exams").insert(fields).select("id").single();
    if (error || !exam) throw examSaveError(error, "Gagal membuat paket soal.");
    return { examId: exam.id as string };
  });

export const adminUpdateExam = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & ExamFields & { examId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const fields = validateExamFields(data);
    const { error } = await admin.from("exams").update(fields).eq("id", data.examId);
    if (error) throw examSaveError(error, "Gagal menyimpan perubahan paket.");
    return { ok: true };
  });

export const adminDeleteExam = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { examId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    // Collect image paths first; the question rows cascade away with the exam.
    const { data: withImages } = await admin
      .from("questions")
      .select("image_path")
      .eq("exam_id", data.examId)
      .not("image_path", "is", null);
    const { error } = await admin.from("exams").delete().eq("id", data.examId);
    if (error) throw new Error("Gagal menghapus paket soal.");
    const paths = (withImages ?? []).map((q) => q.image_path).filter((p): p is string => !!p);
    await removeImages(admin, paths);
    return { ok: true };
  });

export type AdminQuestion = {
  id: string;
  order_index: number;
  text: string;
  image_path: string | null;
  imageUrl: string | null;
  kind: QuestionKind;
  options: string[];
  categories: string[] | null;
  answer: AnswerKey;
  section: string | null;
  explanation: string;
};

export const adminGetQuestions = createServerFn({ method: "GET" })
  .inputValidator((input: AdminInput & { examId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { data: rows, error } = await admin
      .from("questions")
      .select("*")
      .eq("exam_id", data.examId)
      .order("order_index", { ascending: true });
    if (error) throw new Error("Gagal memuat soal.");

    const questions: AdminQuestion[] = [];
    for (const q of rows ?? []) {
      let imageUrl: string | null = null;
      if (q.image_path && isBundledImage(q.image_path)) {
        imageUrl = q.image_path;
      } else if (q.image_path) {
        const { data: signed } = await admin.storage
          .from("exam-images")
          .createSignedUrl(q.image_path, 3600);
        imageUrl = signed?.signedUrl ?? null;
      }
      questions.push({
        id: q.id,
        order_index: q.order_index,
        text: q.text,
        image_path: q.image_path,
        imageUrl,
        kind: isQuestionKind(q.kind) ? q.kind : "single",
        options: q.options as string[],
        categories: (q.categories as string[] | null) ?? null,
        answer: q.answer as AnswerKey,
        section: q.section ?? null,
        explanation: q.explanation ?? "",
      });
    }
    return { questions };
  });

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function contentTypeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return "application/octet-stream";
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

async function uploadImage(
  admin: AdminClient,
  examId: string,
  imageBase64: string,
  imageName: string,
): Promise<string> {
  const bytes = base64ToBytes(imageBase64);
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("Ukuran gambar maksimal 5MB.");
  }
  const safeName = imageName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const imagePath = `${examId}/${Date.now()}-${safeName}`;
  const { error: uploadError } = await admin.storage
    .from("exam-images")
    .upload(imagePath, bytes, { contentType: contentTypeFromName(imageName) });
  if (uploadError) {
    throw new Error("Gagal mengunggah gambar soal.");
  }
  return imagePath;
}

/** Best effort: a leftover file is harmless, so storage errors never fail the request. */
async function removeImages(admin: AdminClient, paths: string[]) {
  // Bundled images belong to the site's files, not to storage.
  const stored = paths.filter((p) => !isBundledImage(p));
  if (stored.length === 0) return;
  await admin.storage.from("exam-images").remove(stored);
}

type QuestionFields = {
  kind: QuestionKind;
  text: string;
  options: string[];
  categories: string[] | null;
  answer: AnswerKey;
  section: string | null;
  explanation: string;
};

const MAX_SECTION = 40;
const MAX_EXPLANATION = 8000;

/** The same rules the editor applies; the database's shape check backs both up. */
function validateQuestionFields(data: QuestionFields) {
  const valid = validateQuestion({
    kind: data.kind,
    text: data.text,
    options: Array.isArray(data.options) ? data.options.map(String) : [],
    categories: Array.isArray(data.categories) ? data.categories.map(String) : null,
    answer: data.answer,
  });
  const section = String(data.section ?? "")
    .trim()
    .replace(/\s+/g, " ");
  if (section.length > MAX_SECTION) {
    throw new Error(`Nama subtes maksimal ${MAX_SECTION} huruf.`);
  }
  const explanation = String(data.explanation ?? "").trim();
  if (explanation.length > MAX_EXPLANATION) {
    throw new Error("Pembahasan terlalu panjang.");
  }
  return { ...valid, section: section || null, explanation };
}

export const adminCreateQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    (
      input: AdminInput &
        QuestionFields & {
          examId: string;
          imageBase64: string | null;
          imageName: string | null;
        },
    ) => input,
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const fields = validateQuestionFields(data);

    // Optional image upload
    const imagePath =
      data.imageBase64 && data.imageName
        ? await uploadImage(admin, data.examId, data.imageBase64, data.imageName)
        : null;

    // Next order index
    const { data: last } = await admin
      .from("questions")
      .select("order_index")
      .eq("exam_id", data.examId)
      .order("order_index", { ascending: false })
      .limit(1);
    const nextOrder = ((last?.[0]?.order_index as number | undefined) ?? 0) + 1;

    const { error } = await admin.from("questions").insert({
      exam_id: data.examId,
      order_index: nextOrder,
      image_path: imagePath,
      ...fields,
    });
    if (error) {
      if (imagePath) await removeImages(admin, [imagePath]);
      throw new Error("Gagal menyimpan soal.");
    }
    return { ok: true };
  });

/**
 * Edit a question. Image handling: a new upload replaces the old file,
 * `removeImage` clears it, otherwise the current image is kept.
 */
export const adminUpdateQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    (
      input: AdminInput &
        QuestionFields & {
          questionId: string;
          imageBase64: string | null;
          imageName: string | null;
          removeImage: boolean;
        },
    ) => input,
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const fields = validateQuestionFields(data);

    const { data: current, error: findError } = await admin
      .from("questions")
      .select("exam_id, image_path")
      .eq("id", data.questionId)
      .maybeSingle();
    if (findError || !current) throw new Error("Soal tidak ditemukan.");

    let imagePath: string | null = current.image_path;
    if (data.imageBase64 && data.imageName) {
      imagePath = await uploadImage(admin, current.exam_id, data.imageBase64, data.imageName);
    } else if (data.removeImage) {
      imagePath = null;
    }

    const { error } = await admin
      .from("questions")
      .update({ ...fields, image_path: imagePath })
      .eq("id", data.questionId);
    if (error) {
      if (imagePath && imagePath !== current.image_path) await removeImages(admin, [imagePath]);
      throw new Error("Gagal menyimpan perubahan soal.");
    }
    if (current.image_path && current.image_path !== imagePath) {
      await removeImages(admin, [current.image_path]);
    }
    return { ok: true };
  });

/** Swap a question with its neighbour above or below. */
export const adminMoveQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { questionId: string; direction: "up" | "down" }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();

    const { data: current } = await admin
      .from("questions")
      .select("id, exam_id, order_index")
      .eq("id", data.questionId)
      .maybeSingle();
    if (!current) throw new Error("Soal tidak ditemukan.");

    const up = data.direction === "up";
    const siblings = admin
      .from("questions")
      .select("id, order_index")
      .eq("exam_id", current.exam_id);
    const { data: neighbours } = await (
      up
        ? siblings.lt("order_index", current.order_index)
        : siblings.gt("order_index", current.order_index)
    )
      .order("order_index", { ascending: !up })
      .limit(1);
    const neighbour = neighbours?.[0];
    if (!neighbour) return { ok: true };

    const [a, b] = await Promise.all([
      admin.from("questions").update({ order_index: neighbour.order_index }).eq("id", current.id),
      admin.from("questions").update({ order_index: current.order_index }).eq("id", neighbour.id),
    ]);
    if (a.error || b.error) throw new Error("Gagal mengubah urutan soal.");
    return { ok: true };
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { questionId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { data: current } = await admin
      .from("questions")
      .select("image_path")
      .eq("id", data.questionId)
      .maybeSingle();
    const { error } = await admin.from("questions").delete().eq("id", data.questionId);
    if (error) throw new Error("Gagal menghapus soal.");
    if (current?.image_path) await removeImages(admin, [current.image_path]);
    return { ok: true };
  });

export type AdminNews = {
  id: string;
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  track: Track;
  published_on: string;
};

type NewsFields = Omit<AdminNews, "id">;

function validateNewsFields(input: NewsFields): NewsFields {
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("Judul berita tidak boleh kosong.");
  let url: URL;
  try {
    url = new URL(String(input.source_url ?? "").trim());
  } catch {
    throw new Error("Tautan sumber harus alamat lengkap, misal https://….");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Tautan sumber harus diawali https://.");
  }
  if (!isTrack(input.track)) throw new Error("Pilih jalur berita.");
  const day = String(input.published_on ?? "").trim();
  if (!DAY.test(day) || Number.isNaN(Date.parse(day))) {
    throw new Error("Tanggal berita tidak valid.");
  }
  return {
    title,
    summary: String(input.summary ?? "").trim(),
    // Default to the site's host so every item names where it came from.
    source_name: String(input.source_name ?? "").trim() || url.hostname.replace(/^www\./, ""),
    source_url: url.toString(),
    track: input.track,
    published_on: day,
  };
}

export const adminListNews = createServerFn({ method: "GET" })
  .inputValidator((input: AdminInput) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { data: rows, error } = await admin
      .from("news")
      .select("id, title, summary, source_name, source_url, track, published_on")
      .order("published_on", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error("Gagal memuat berita.");
    const news: AdminNews[] = (rows ?? []).map((r) => ({ ...r, track: toTrack(r.track) }));
    return { news };
  });

/** Create a news item, or update it when `newsId` is given. */
export const adminSaveNews = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & NewsFields & { newsId: string | null }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const fields = validateNewsFields(data);
    const { error } = data.newsId
      ? await admin.from("news").update(fields).eq("id", data.newsId)
      : await admin.from("news").insert(fields);
    if (error) throw new Error("Gagal menyimpan berita.");
    return { ok: true };
  });

export const adminDeleteNews = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { newsId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { error } = await admin.from("news").delete().eq("id", data.newsId);
    if (error) throw new Error("Gagal menghapus berita.");
    return { ok: true };
  });

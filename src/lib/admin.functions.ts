import { createServerFn } from "@tanstack/react-start";

/**
 * Admin server functions. Every call re-verifies the admin token
 * (HMAC-signed, issued by adminLogin) before touching privileged data via
 * the service-role client — the UI gate is convenience only.
 */

type AdminInput = { token: string };

async function assertAdmin(token: string | undefined) {
  const { verifyAdminToken } = await import("@/server/admin-auth");
  const ok = await verifyAdminToken(token);
  if (!ok) throw new Error("Sesi admin tidak valid. Masukkan kode akses lagi.");
}

async function adminClient() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => input)
  .handler(async ({ data }) => {
    const { createAdminToken } = await import("@/server/admin-auth");
    const token = await createAdminToken(data.code);
    if (!token) return { token: null };
    return { token };
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
  questionCount: number;
};

export const adminListExams = createServerFn({ method: "GET" })
  .inputValidator((input: AdminInput) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { data: rows, error } = await admin
      .from("exams")
      .select("id, title, description, duration_minutes, questions(count)")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Gagal memuat daftar katalog.");
    const exams: AdminExam[] = (rows ?? []).map((r) => {
      const counts = (r as { questions?: { count: number }[] }).questions ?? [];
      return {
        id: r.id,
        title: r.title,
        description: r.description,
        duration_minutes: r.duration_minutes,
        questionCount: counts[0]?.count ?? 0,
      };
    });
    return { exams };
  });

export const adminCreateExam = createServerFn({ method: "POST" })
  .inputValidator(
    (input: AdminInput & { title: string; description: string; duration_minutes: number }) => input,
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const title = data.title.trim();
    if (!title) throw new Error("Judul katalog tidak boleh kosong.");
    if (!Number.isFinite(data.duration_minutes) || data.duration_minutes <= 0) {
      throw new Error("Durasi harus lebih dari 0 menit.");
    }
    const { data: exam, error } = await admin
      .from("exams")
      .insert({
        title,
        description: data.description.trim(),
        duration_minutes: Math.round(data.duration_minutes),
      })
      .select("id")
      .single();
    if (error || !exam) throw new Error("Gagal membuat katalog ujian.");
    return { examId: exam.id as string };
  });

export const adminDeleteExam = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { examId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { error } = await admin.from("exams").delete().eq("id", data.examId);
    if (error) throw new Error("Gagal menghapus katalog ujian.");
    return { ok: true };
  });

export type AdminQuestion = {
  id: string;
  order_index: number;
  text: string;
  image_path: string | null;
  imageUrl: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
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
      if (q.image_path) {
        const { data: signed } = await admin
          .storage
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
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
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

export const adminCreateQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    (input: AdminInput & {
      examId: string;
      text: string;
      imageBase64: string | null;
      imageName: string | null;
      option_a: string;
      option_b: string;
      option_c: string;
      option_d: string;
      correct_option: string;
    }) => input,
  )
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();

    if (!data.text.trim()) throw new Error("Teks soal tidak boleh kosong.");
    const options = [data.option_a, data.option_b, data.option_c, data.option_d];
    if (options.some((o) => !o.trim())) throw new Error("Semua opsi jawaban harus diisi.");
    if (!["a", "b", "c", "d"].includes(data.correct_option)) {
      throw new Error("Pilih kunci jawaban (A/B/C/D).");
    }

    // Optional image upload
    let imagePath: string | null = null;
    if (data.imageBase64 && data.imageName) {
      const bytes = base64ToBytes(data.imageBase64);
      if (bytes.byteLength > MAX_IMAGE_BYTES) {
        throw new Error("Ukuran gambar maksimal 5MB.");
      }
      const safeName = data.imageName.replace(/[^a-zA-Z0-9._-]/g, "_");
      imagePath = `${data.examId}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await admin
        .storage
        .from("exam-images")
        .upload(imagePath, bytes, { contentType: contentTypeFromName(data.imageName) });
      if (uploadError) {
        throw new Error("Gagal mengunggah gambar soal.");
      }
    }

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
      text: data.text.trim(),
      image_path: imagePath,
      option_a: data.option_a.trim(),
      option_b: data.option_b.trim(),
      option_c: data.option_c.trim(),
      option_d: data.option_d.trim(),
      correct_option: data.correct_option,
    });
    if (error) throw new Error("Gagal menyimpan soal.");
    return { ok: true };
  });

export const adminDeleteQuestion = createServerFn({ method: "POST" })
  .inputValidator((input: AdminInput & { questionId: string }) => input)
  .handler(async ({ data }) => {
    await assertAdmin(data.token);
    const admin = await adminClient();
    const { error } = await admin.from("questions").delete().eq("id", data.questionId);
    if (error) throw new Error("Gagal menghapus soal.");
    return { ok: true };
  });

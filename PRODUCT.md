# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Peserta (user):** terutama siswa SMA (katalog contoh berisi mata pelajaran SMA), tetapi katalog bebas untuk jenjang apa pun. Peserta tidak membuat akun. Mereka membuka TryOutKu untuk berlatih soal pilihan ganda dalam kondisi mirip ujian sungguhan (waktu terbatas), lalu melihat skor dan posisinya dibanding peserta lain. Bisa dari laptop maupun ponsel.
- **Admin:** pengelola konten yang menyusun katalog ujian beserta soalnya (termasuk gambar soal), mengatur durasi, dan merapikan isi katalog.

## Product Purpose

Platform try out ujian online: peserta memilih katalog ujian, mengerjakan soal pilihan ganda dengan timer, mengirim jawaban, langsung melihat skor akhir, dan hasil terbaiknya masuk leaderboard katalog tersebut. Sukses = peserta menyelesaikan try out tanpa hambatan, memahami skornya, dan termotivasi kembali untuk memperbaiki peringkat.

## Positioning

Try out yang terasa seperti ujian sungguhan tetapi tanpa gesekan: tanpa akun, cukup tulis nama sebelum mulai, timer ketat dengan kirim otomatis, jawaban tahan refresh, skor dinilai di server, dan peringkat langsung terlihat per katalog.

## Operating Context

- Alur peserta (tanpa akun): beranda → katalog (`/katalog`) → pilih mata pelajaran → tulis nama di layar persiapan → mengerjakan (timer berjalan, navigasi antar soal) → kirim (manual atau otomatis saat waktu habis) → hasil & leaderboard → bisa mengerjakan ulang.
- Alur admin: buka `/admin` → masukkan kata sandi admin (pemilik memilih "Rayhan123"; disimpan sebagai hash SHA-256, secret `ADMIN_ACCESS_CODE` juga diterima; token HMAC 12 jam) → kelola katalog → kelola soal per katalog. Tombol "Isi katalog contoh SMA" menambahkan 12 mata pelajaran contoh.
- Bahasa antarmuka: Bahasa Indonesia, nada santai-sopan ("kamu").

## Capabilities and Constraints

- Stack: TanStack Start + React 19, Tailwind CSS v4, komponen shadcn/Radix, Supabase (auth, Postgres, storage bucket privat `exam-images`). Proyek tersambung ke Lovable; branch `main` harus selalu dalam kondisi berjalan.
- Tanpa akun peserta: pengiriman pertama membuat profil "tamu" di server (service role) dengan nama yang ditulis; browser menyimpan token HMAC tamu. Nama yang sama di browser yang sama = peserta yang sama; nama berbeda = peserta baru (lab sekolah). Semua baca/tulis peserta lewat server function publik; kunci jawaban tidak pernah dikirim ke browser.
- Rute lama `/auth` dan `/dashboard` dialihkan ke `/katalog`.
- Soal: pilihan ganda 4 opsi (A–D), satu kunci, gambar opsional (maks 5MB, png/jpg/webp/gif).
- Penilaian di server (`submitGuestAttempt`). Tidak ada peringkat keseluruhan: tiap katalog punya papannya sendiri (`/peringkat/$examId`, tombol "Peringkat" di kartu katalog); leaderboard = percobaan terbaik per peserta, seri dipecah oleh waktu kirim lebih awal.
- Peserta boleh mengerjakan ulang tanpa batas; semua percobaan tersimpan.
- Belum ada: pembahasan/penjelasan jawaban, kategori katalog, foto profil.

## Brand Commitments

- Nama: **TryOutKu**.
- Arah visual dipatok pemilik: gaya Apple, seimersif mungkin, **campuran**: beranda dan momen besar (hasil skor) gelap sinematik; halaman kerja (katalog, ujian, admin, peringkat) terang dan bersih.
- Beranda menampilkan perangkat (laptop, tablet, ponsel) berisi aplikasi, dan langkah-langkah sebagai galeri geser ala apple.com.

## Evidence on Hand

- Ilustrasi `src/assets/hero.png` (siswa mengerjakan ujian; gaya flat krem/navy — warisan tampilan lama).
- Katalog contoh: "Try Out Matematika Dasar" (seed awal) dan 12 mata pelajaran SMA di `src/lib/sma-catalog.ts` (5 soal tiap mapel; sudah dimasukkan ke database pada 23 Okt 2026, tombol admin "Isi katalog contoh SMA" bisa mengisinya ulang).
- Tidak ada testimoni, jumlah pengguna, mitra, atau statistik nyata — jangan dikarang.

## Product Principles

1. Ujian adalah momen fokus: saat mengerjakan, hanya soal, pilihan, dan waktu yang penting.
2. Skor harus jujur dan langsung: dinilai server, tampil seketika, posisi di leaderboard jelas.
3. Tanpa gesekan: tanpa akun, cukup nama; jawaban tidak hilang; waktu habis tetap terkirim.
4. Admin bekerja cepat: membuat, mengedit, dan merapikan soal tanpa keluar dari satu layar kerja.

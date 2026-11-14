# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Peserta (user):** pencari kerja yang bersiap menghadapi tes seleksi CPNS (SKD: TWK, TIU, TKP), rekrutmen BUMN (TKD, AKHLAK, bahasa Inggris), dan program ODP perbankan (TPA, psikotes, bahasa Inggris). Kebanyakan lulusan baru atau pekerja muda yang belajar di sela kesibukan, sering dari ponsel. Akun opsional: tanpa akun cukup tulis nama; dengan akun (nama pengguna + kata sandi, tanpa email) peserta bisa masuk dari perangkat lain dan punya halaman Profil.
- **Admin:** pengelola konten yang menerbitkan satu paket soal setiap hari, menulis pembahasan tiap soal, menyusun paket latihan per jalur, dan memuat berita seleksi.

## Product Purpose

lulustes membantu peserta membangun rutinitas persiapan tes: setiap hari terbit satu paket soal. Peserta mengerjakannya dengan timer, langsung melihat skor dan posisinya di papan peringkat, lalu membaca mana yang benar, mana yang salah, dan pembahasan tiap soal; laporan dan pembahasannya bisa disimpan sebagai PDF. Hari beruntun menghitung berapa hari berturut-turut paket dikirim di harinya. Sukses = peserta kembali besok.

## Positioning

Satu paket soal sehari, sampai lulus tes. USP-nya rutinitas: paket harian yang ringan, hari beruntun yang dijaga, dan pembahasan yang langsung terbuka setelah mengirim. Tetap tanpa gesekan: akun opsional, cukup tulis nama, timer ketat dengan kirim otomatis, jawaban tahan refresh, skor dinilai di server.

## Operating Context

- Alur peserta (tanpa akun, atau sudah masuk sehingga nama terisi dari akun): beranda → **Hari ini** (`/hari-ini`, rumah rutinitas) → paket hari ini → tulis nama → mengerjakan → kirim (manual atau otomatis saat waktu habis) → layar skor (`/hasil/$examId`) → **Pembahasan** (`/pembahasan/$attemptId`: benar/salah tiap soal, kunci, pembahasan, laporan per subtes, Unduh PDF) → besok kembali ke Hari ini.
- Menu peserta: Hari ini · Latihan (`/katalog`: semua paket terbuka, termasuk paket harian yang terlewat, disaring per jalur `?jalur=cpns|bumn|odp`) · Berita (`/berita`), plus tombol "Masuk" di kanan bar (selama belum masuk akun, juga di header beranda) dan avatar yang membuka Profil (`/profil`). Layar skor menawarkan "Simpan skor ini ke akun" (Masuk / Buat akun) bagi yang belum masuk. Di ponsel menjadi tab bar bawah empat tab (Hari ini · Latihan · Berita · Profil).
- Profil (`/profil`): nama dan @username, hari beruntun + week strip, ringkasan (paket dikerjakan, rata-rata dan skor terbaik percobaan pertama), chart **Skor harian** (% benar percobaan pertama tiap paket harian, kosong di hari yang terlewat), dan Riwayat kiriman yang membuka pembahasan. Tamu tanpa akun juga punya profil di browser-nya, dengan ajakan "Simpan progresmu ke akun".
- Alur admin: `/admin` → kata sandi admin (pemilik memilih "Rayhan123"; disimpan sebagai hash SHA-256, secret `ADMIN_ACCESS_CODE` juga diterima; token HMAC 12 jam) → tampilan **Paket soal** (buat paket, pilih jalur, jadwalkan sebagai paket harian bertanggal, tulis soal + subtes + pembahasan) atau **Berita** (judul, ringkasan, tautan sumber resmi, jalur, tanggal).
- Bahasa antarmuka: Bahasa Indonesia, nada santai-sopan ("kamu"). Kosakata: paket (bukan katalog), paket harian / paket hari ini, Latihan, hari beruntun, pembahasan, laporan, jalur, subtes.

## Capabilities and Constraints

- Stack: TanStack Start + React 19, Tailwind CSS v4, komponen shadcn/Radix, Supabase (Postgres, storage bucket privat `exam-images`). Proyek tersambung ke Lovable; branch `main` harus selalu dalam kondisi berjalan. Perubahan database ada di `drizzle/migrations` (terbaru `0007_akun_profil.sql`) dan diterapkan lewat Lovable.
- Tanpa akun peserta: pengiriman pertama membuat "tamu" di database dengan nama yang ditulis; browser menyimpan id dan kunci rahasia tamu. Nama yang sama di browser yang sama = peserta yang sama. Semua baca/tulis peserta lewat fungsi database `security definer` yang bisa dipanggil dengan kunci publik.
- Akun (migration 0007): `register_account` menempelkan nama pengguna (3–20: huruf kecil, angka, titik, garis bawah) dan kata sandi (min. 6, bcrypt) ke tamu di browser itu, jadi riwayat dan hari beruntunnya ikut; `login_account` memberi browser lain kuncinya sendiri (tabel `guest_keys`, hanya hash), dan kalau browser itu sebelumnya tamu tanpa akun, percobaan tamu itu dipindah ke akun (jadi masuk tepat setelah mengerjakan tetap menyimpan skornya). Saat masuk akun, ujian memakai nama akun dan selalu tercatat ke akun itu. Belum ada pemulihan kata sandi (tidak ada email) dan belum ada batas percobaan masuk.
- Paket harian berisi **25 soal** mulai 14 Nov 2026 (permintaan pemilik; `DAILY_QUESTION_COUNT` di `src/lib/daily-package.ts`, admin melihat "x dari 25 soal"). Durasi bawaan paket baru 30 menit.
- Paket harian: `exams.daily_date` (tanggal WIB, satu tanggal satu paket). Paket bertanggal di masa depan tersembunyi dan tidak bisa dikirim sampai harinya. Setelah lewat, paket tetap ada di Latihan.
- Hari beruntun: jumlah hari paket berturut-turut yang paketnya dikirim pada hari itu juga (WIB). Hari tanpa paket tidak memutusnya; paket hari ini yang belum dikirim belum memutusnya.
- Jalur: `exams.track` dan `news.track` ∈ cpns, bumn, odp, umum.
- Soal: pilihan ganda (2–6 opsi, SKD memakai 5), pilihan ganda kompleks, dan kategori (Benar/Salah dsb.), gambar opsional (maks 5MB), subtes opsional (`questions.section`), pembahasan (`questions.explanation`).
- Penilaian di database (`submit_attempt`). Kunci dan pembahasan hanya dikirim untuk percobaan milik tamu itu sendiri (`get_attempt_review`). Karena kunci terbuka setelah mengirim, **papan peringkat memakai percobaan pertama** tiap peserta; seri dipecah oleh waktu kirim lebih awal. Mengerjakan ulang boleh tanpa batas untuk latihan, tidak mengubah peringkat.
- Unduh PDF = halaman pembahasan dengan stylesheet cetak; tombolnya membuka dialog cetak browser ("Simpan sebagai PDF") dengan nama file `lulustes-pembahasan-<paket>-<tanggal>`.
- Berita dikurasi admin dan selalu menautkan sumber aslinya; lulustes tidak menulis ulang pengumuman.
- Belum ada: penilaian TKP berbobot 1–5 (TKP saat ini dinilai benar/salah seperti soal lain), nilai ambang batas SKD, pengingat harian (notifikasi), foto profil.

## Brand Commitments

- Nama: **lulustes** (huruf kecil semua).
- Arah visual dipatok pemilik: gaya Apple, seimersif mungkin, **campuran**: beranda dan momen besar (hasil skor) gelap sinematik; halaman kerja (Hari ini, Latihan, Berita, ujian, pembahasan, admin, peringkat) terang dan bersih.
- Beranda menampilkan perangkat (laptop, tablet, ponsel) berisi aplikasi, dan langkah-langkah sebagai galeri geser ala apple.com.

## Evidence on Hand

- Paket contoh "Paket Harian SKD #1" (12 soal orisinal: 5 TWK, 7 TIU, lengkap dengan pembahasan) ditanam oleh migration 0006 untuk tanggal migration dijalankan.
- "Paket Harian SKD #2" (25 soal orisinal: 10 TWK, 15 TIU, 30 menit, dengan pembahasan) ditanam oleh migration 0007 untuk 14 Nov 2026.
- Katalog contoh SMA lama dan TKA Geografi dihapus oleh migration 0006 atas permintaan pemilik (12 Nov 2026).
- Foto sampul dari Wikimedia Commons (Gedung Pancasila, Borobudur, Raja Ampat, Bromo, dll.) dipetakan ke subtes; kreditnya di halaman Latihan.
- Section beranda "Kenapa harus tiap hari?" disederhanakan (14 Nov 2026, permintaan pemilik) menjadi satu kerangka **Uji → Cicil → Ulangi**, satu angka per langkah (56% vs 42%, 2 dari 10 teknik, 66 hari). Ia memakai tiga sumber yang sudah dicek ke paper atau ringkasan resminya (12 Nov 2026): Lally dkk. 2010 (96 relawan, 84 hari, median 66 hari sampai 95% puncak otomatisitas pada 39 peserta yang kurvanya terukur, rentang 18–254, satu kali terlewat tidak berpengaruh berarti); Roediger & Karpicke 2006 (Eksp. 1, 120 mahasiswa: baca ulang vs diuji 81/75% setelah 5 menit, 54/68% setelah 2 hari, 42/56% setelah 1 minggu; Eksp. 2: STTT 61% vs SSSS 40% setelah seminggu, membaca 3,4 vs 14,2 kali); Dunlosky dkk. 2013 (latihan soal dan latihan berjarak bermanfaat tinggi; membaca ulang dan menstabilo rendah). Angka baru di section itu harus dari sumber yang dicek, bukan ingatan.
- Tidak ada testimoni, jumlah pengguna, mitra, berita, atau statistik nyata tentang lulustes — jangan dikarang. Berita hanya yang dimuat admin dari sumber resmi.

## Product Principles

1. Rutinitas di atas segalanya: paket hari ini selalu satu ketukan dari mana pun, dan hari beruntun terlihat tanpa dicari.
2. Ujian adalah momen fokus: saat mengerjakan, hanya soal, pilihan, dan waktu yang penting.
3. Skor jujur, pembahasan langsung: dinilai server, tampil seketika, lalu setiap kesalahan dijelaskan.
4. Tanpa gesekan: akun opsional, cukup nama; jawaban tidak hilang; waktu habis tetap terkirim.
5. Admin bekerja cepat: menerbitkan paket harian, menulis soal dan pembahasan, dan memuat berita tanpa keluar dari satu layar kerja.

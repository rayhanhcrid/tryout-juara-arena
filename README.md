# lulustes

Latihan harian untuk tes CPNS, BUMN, dan ODP. Setiap hari terbit satu paket soal; peserta mengerjakannya dengan timer, melihat skor dan posisinya di papan peringkat, lalu membaca mana yang benar, mana yang salah, dan pembahasan tiap soal (bisa disimpan sebagai PDF). Hari beruntun menghitung berapa hari berturut-turut paket dikirim di harinya.

- **Peserta** (tanpa akun, cukup nama): Hari ini (`/hari-ini`), Latihan (`/katalog`, semua paket per jalur), Berita (`/berita`), layar skor (`/hasil/$examId`), pembahasan + laporan (`/pembahasan/$attemptId`), peringkat per paket (`/peringkat/$examId`).
- **Admin** (`/admin`): kelola paket soal (jalur, jadwal paket harian, soal, subtes, pembahasan, gambar) dan berita seleksi.

Detail produk ada di [PRODUCT.md](PRODUCT.md), sistem desain di [DESIGN.md](DESIGN.md). Perubahan database ada di `drizzle/migrations` (terbaru `0006_lulustes_daily.sql`).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d2fe5e30-64ed-49b5-8a62-f487bad470e5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---
version: 1
slug: "src-routes-authenticated-route-tsx"
primary_target: "src/routes/_authenticated/route.tsx"
related_targets: ["src/routes/_authenticated/dashboard.tsx","src/routes/_authenticated/ujian.$examId.tsx","src/routes/_authenticated/hasil.$examId.tsx","src/routes/_authenticated/peringkat.tsx","src/routes/auth.tsx","src/routes/admin.tsx"]
---

# App shell & screens (/dashboard, /ujian/$examId, /hasil/$examId, /peringkat, /auth, /admin)

Mode: Operate. Tasks: peserta memilih katalog, mengerjakan ujian bertimer, membaca skor & peringkat; admin mengelola katalog dan soal (buat, edit, urutkan, hapus, gambar). Important states: loading, kosong, ujian sedang berlangsung (resume), waktu < 5 menit / < 1 menit, mengirim, gagal kirim, token admin kedaluwarsa.

## Direction contract

THESIS: Every screen behaves like a first-party iOS/macOS app: large titles, grouped inset lists, sheets and segmented controls, so the visitor knows where everything is before noticing the style. Refuses the generic SaaS dashboard of bordered cards and badges.

OWN-WORLD: iOS grouped background #f2f2f7/#f5f5f7, white rounded-2xl surfaces without borders, #1d1d1f ink, #6e6e73 secondary, blue #0071e3 for action and selection, system green/orange/red for answered/time/destructive, deterministic iOS-colour covers per catalog. SF Pro with Inter fallback, tabular numerals for time and scores.

STORY: Peserta finds a catalog, enters a distraction-free focus mode, submits, and sees score and rank at once. Admin edits a catalog and its questions in one split view.

FIRST VIEWPORT: frosted top bar (logo, Katalog / Peringkat, avatar menu; bottom tab bar on phones); large title "Katalog" with greeting and search; resume banner when an attempt is running; covered catalog grid.

FORM: owner-pinned Apple light world, no roll. Signature: the exam intro's full timer ring morphs into the running timer pill (view transition); the result ring fills while the score counts up. seed: none (direction pinned by owner; no roll)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

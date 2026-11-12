-- lulustes: latihan harian untuk tes CPNS, BUMN, dan ODP (needs 0004).
--   * Paket harian: exams.daily_date, a date in WIB (Asia/Jakarta). One
--     package per date; a package dated in the future stays hidden and
--     cannot be submitted until its day.
--   * Jalur: exams.track (cpns, bumn, odp, umum).
--   * Pembahasan: questions.explanation, plus questions.section (the subtes,
--     e.g. TWK or TIU) for the per-section report.
--   * Answer keys and explanations are shown after submitting, so the
--     leaderboard now ranks each participant's FIRST attempt.
--   * Hari beruntun (streak): consecutive package days whose package was
--     submitted on that same day. A day without a package never breaks it.
--   * Berita: selection news curated by the admin, each linking its source.
--   * The old SMA demo catalogs are removed.
-- Mirrors src/lib/tracks.ts. Idempotent.

-- ============ REMOVE THE SMA DEMO CATALOGS ============
-- Questions and attempts cascade. Limited to rows created before the pivot,
-- so a new package that happens to reuse one of these titles is never touched.
delete from public.exams
where created_at < '2026-11-01'
  and title in (
    'Try Out Matematika Dasar', 'TKA Geografi 2025',
    'Matematika', 'Fisika', 'Kimia', 'Biologi', 'Bahasa Indonesia', 'Bahasa Inggris',
    'Sejarah Indonesia', 'Geografi', 'Ekonomi', 'Sosiologi', 'Pendidikan Pancasila',
    'Informatika'
  );

-- ============ COLUMNS ============
alter table public.exams add column if not exists track text not null default 'umum';
alter table public.exams drop constraint if exists exams_track_check;
alter table public.exams
  add constraint exams_track_check check (track in ('cpns', 'bumn', 'odp', 'umum'));
alter table public.exams add column if not exists daily_date date;
create unique index if not exists exams_daily_date_key on public.exams (daily_date);

alter table public.questions add column if not exists explanation text not null default '';
alter table public.questions add column if not exists section text;

-- ============ DATES ============
create or replace function public.today_wib()
returns date
language sql stable
as $$ select (now() at time zone 'Asia/Jakarta')::date $$;

-- A daily package opens on its own date; everything else is always open.
create or replace function public.exam_open(p_daily_date date)
returns boolean
language sql stable
as $$ select p_daily_date is null or p_daily_date <= public.today_wib() $$;

-- ============ NEWS ============
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  source_name text not null default '',
  source_url text not null check (source_url ~ '^https?://'),
  track text not null default 'umum' check (track in ('cpns', 'bumn', 'odp', 'umum')),
  published_on date not null default public.today_wib(),
  created_at timestamptz not null default now()
);
alter table public.news enable row level security;
grant all on public.news to service_role;
-- No grants or policies for anon/authenticated: participants read through get_news.
create index if not exists news_published_idx on public.news (published_on desc, created_at desc);

-- ============ PARTICIPANT FUNCTIONS ============
-- The return columns change, so the old signature is dropped first.
drop function if exists public.get_catalog(uuid, text);
create function public.get_catalog(p_guest_id uuid default null, p_guest_key text default null)
returns table (
  id uuid, title text, description text, duration_minutes integer,
  question_count integer, attempt_count integer, my_best_score integer, my_best_total integer,
  track text, daily_date date
)
language sql stable security definer set search_path = public
as $$
  with me as (
    select case when public.guest_key_ok(p_guest_id, p_guest_key) then p_guest_id end as gid
  )
  select e.id, e.title, e.description, e.duration_minutes,
    (select count(*)::int from questions q where q.exam_id = e.id),
    (select count(*)::int from attempts a where a.exam_id = e.id),
    b.sc, b.tt, e.track, e.daily_date
  from exams e
  cross join me
  left join lateral (
    select a.score as sc, a.total as tt from attempts a
    where a.exam_id = e.id and me.gid is not null and a.guest_id = me.gid
    order by a.score desc, a.submitted_at asc
    limit 1
  ) b on true
  where public.exam_open(e.daily_date)
  order by e.featured desc, e.daily_date desc nulls last, e.created_at;
$$;

-- One open exam and its questions, without the answer keys or explanations.
create or replace function public.get_exam_for_taking(p_exam_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'exam', jsonb_build_object(
      'id', e.id, 'title', e.title, 'description', e.description,
      'duration_minutes', e.duration_minutes, 'track', e.track, 'daily_date', e.daily_date
    ),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'kind', q.kind, 'text', q.text, 'image_path', q.image_path,
        'options', q.options, 'categories', q.categories, 'section', q.section
      ) order by q.order_index)
      from questions q where q.exam_id = e.id
    ), '[]'::jsonb)
  )
  from exams e
  where e.id = p_exam_id
    and public.exam_open(e.daily_date);
$$;

-- As in 0004, except that a package which has not opened yet cannot be sent.
create or replace function public.submit_attempt(
  p_exam_id uuid, p_answers jsonb, p_nama text,
  p_guest_id uuid default null, p_guest_key text default null
)
returns table (attempt_id uuid, score integer, total integer, guest_id uuid, nama text)
language plpgsql security definer set search_path = public
as $$
#variable_conflict use_column
declare
  v_nama text := left(regexp_replace(btrim(coalesce(p_nama, '')), '\s+', ' ', 'g'), 40);
  v_total integer;
  v_score integer;
  v_clean jsonb;
  v_guest uuid;
  v_attempt uuid;
begin
  if char_length(v_nama) < 2 then
    raise exception 'Tulis namamu dulu, minimal 2 huruf.' using errcode = '22023';
  end if;
  if coalesce(char_length(p_guest_key), 0) < 16 then
    raise exception 'Kunci peserta tidak valid.' using errcode = '22023';
  end if;

  select count(*)::int into v_total
  from questions q
  join exams e on e.id = q.exam_id
  where q.exam_id = p_exam_id and public.exam_open(e.daily_date);
  if v_total = 0 then
    raise exception 'Soal ujian tidak ditemukan.' using errcode = 'P0002';
  end if;

  select coalesce(jsonb_object_agg(g.id::text, g.given) filter (where g.given is not null), '{}'::jsonb),
         (count(*) filter (where public.answer_correct(g.kind, g.key, g.given)))::int
    into v_clean, v_score
  from (
    select q.id, q.kind, q.answer as key,
      public.clean_answer(
        q.kind, q.options, q.categories,
        case when jsonb_typeof(p_answers) = 'object' then p_answers -> q.id::text end
      ) as given
    from questions q
    where q.exam_id = p_exam_id
  ) g;

  if p_guest_id is not null and public.guest_key_ok(p_guest_id, p_guest_key) then
    v_guest := p_guest_id;
    update guests g set nama = v_nama where g.id = v_guest;
  else
    insert into guests (nama, key_hash)
    values (v_nama, encode(sha256(convert_to(p_guest_key, 'UTF8')), 'hex'))
    returning guests.id into v_guest;
  end if;

  insert into attempts (exam_id, guest_id, answers, score, total)
  values (p_exam_id, v_guest, v_clean, coalesce(v_score, 0), v_total)
  returning attempts.id into v_attempt;

  return query select v_attempt, coalesce(v_score, 0), v_total, v_guest, v_nama;
end
$$;

-- First attempt per participant; ties go to whoever sent it earlier.
create or replace function public.get_leaderboard(p_exam_id uuid)
returns table (
  rank integer, participant_id uuid, nama text, score integer, total integer, submitted_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  with firsts as (
    select distinct on (coalesce(a.user_id, a.guest_id))
      coalesce(a.user_id, a.guest_id) as pid,
      coalesce(nullif(g.nama, ''), nullif(p.nama, ''), p.username, 'Peserta') as nm,
      a.score as sc, a.total as tt, a.submitted_at as at
    from attempts a
    left join profiles p on p.id = a.user_id
    left join guests g on g.id = a.guest_id
    where a.exam_id = p_exam_id
    order by coalesce(a.user_id, a.guest_id), a.submitted_at asc
  )
  select (row_number() over (order by f.sc desc, f.at asc))::int, f.pid, f.nm, f.sc, f.tt, f.at
  from firsts f
  order by f.sc desc, f.at asc;
$$;

-- One of the guest's own attempts with every question's key, the answer
-- given, whether it earned the point, and the explanation. Null when the
-- attempt is not theirs.
create or replace function public.get_attempt_review(
  p_attempt_id uuid, p_guest_id uuid, p_guest_key text
)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'attempt', jsonb_build_object(
      'id', a.id, 'score', a.score, 'total', a.total, 'submitted_at', a.submitted_at,
      'nama', g.nama,
      'number', (
        select count(*)::int from attempts x
        where x.exam_id = a.exam_id and x.guest_id = a.guest_id and x.submitted_at <= a.submitted_at
      )
    ),
    'exam', jsonb_build_object(
      'id', e.id, 'title', e.title, 'description', e.description,
      'duration_minutes', e.duration_minutes, 'track', e.track, 'daily_date', e.daily_date
    ),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'kind', q.kind, 'text', q.text, 'image_path', q.image_path,
        'options', q.options, 'categories', q.categories, 'section', q.section,
        'explanation', q.explanation, 'key', q.answer, 'given', r.given,
        'correct', public.answer_correct(q.kind, q.answer, r.given)
      ) order by q.order_index)
      from questions q
      cross join lateral (
        select public.clean_answer(q.kind, q.options, q.categories, a.answers -> q.id::text) as given
      ) r
      where q.exam_id = e.id
    ), '[]'::jsonb)
  )
  from attempts a
  join exams e on e.id = a.exam_id
  join guests g on g.id = a.guest_id
  where a.id = p_attempt_id
    and a.guest_id = p_guest_id
    and public.guest_key_ok(p_guest_id, p_guest_key);
$$;

-- Today's package, the guest's first attempt at it, their streak, and the
-- last seven days.
create or replace function public.get_daily(p_guest_id uuid default null, p_guest_key text default null)
returns jsonb
language plpgsql stable security definer set search_path = public
as $$
declare
  v_today date := public.today_wib();
  v_gid uuid;
  v_exam public.exams%rowtype;
  v_package jsonb;
  v_mine jsonb;
  v_current integer := 0;
  v_best integer := 0;
  v_days jsonb;
begin
  if p_guest_id is not null and public.guest_key_ok(p_guest_id, p_guest_key) then
    v_gid := p_guest_id;
  end if;

  select * into v_exam from exams e where e.daily_date = v_today;
  if found then
    v_package := jsonb_build_object(
      'id', v_exam.id, 'title', v_exam.title, 'description', v_exam.description,
      'duration_minutes', v_exam.duration_minutes, 'track', v_exam.track,
      'question_count', (select count(*)::int from questions q where q.exam_id = v_exam.id),
      'attempt_count', (select count(*)::int from attempts a where a.exam_id = v_exam.id)
    );
    if v_gid is not null then
      select jsonb_build_object(
        'attempt_id', a.id, 'score', a.score, 'total', a.total, 'submitted_at', a.submitted_at
      ) into v_mine
      from attempts a
      where a.exam_id = v_exam.id and a.guest_id = v_gid
      order by a.submitted_at asc
      limit 1;
    end if;
  end if;

  -- Package days so far, in order; a day is kept when its package was sent that same day.
  with pkg as (
    select e.daily_date as d, row_number() over (order by e.daily_date) as i
    from exams e
    where e.daily_date is not null and e.daily_date <= v_today
      and exists (select 1 from questions q where q.exam_id = e.id)
  ),
  marked as (
    select p.d, p.i,
      v_gid is not null and exists (
        select 1 from attempts a
        join exams e on e.id = a.exam_id
        where a.guest_id = v_gid and e.daily_date = p.d
          and (a.submitted_at at time zone 'Asia/Jakarta')::date = p.d
      ) as ok
    from pkg p
  ),
  runs as (
    select count(*)::int as n
    from (select m.i - row_number() over (order by m.i) as grp from marked m where m.ok) t
    group by t.grp
  )
  select
    -- Kept days after the last missed one; today still open does not count as missed.
    (select count(*)::int from marked m
      where m.ok and m.i > coalesce((select max(x.i) from marked x where not x.ok and x.d < v_today), 0)),
    coalesce((select max(r.n) from runs r), 0)
  into v_current, v_best;

  select jsonb_agg(jsonb_build_object(
    'date', s.d,
    'package', exists (
      select 1 from exams e
      where e.daily_date = s.d and exists (select 1 from questions q where q.exam_id = e.id)
    ),
    'done', v_gid is not null and exists (
      select 1 from attempts a
      join exams e on e.id = a.exam_id
      where a.guest_id = v_gid and e.daily_date = s.d
        and (a.submitted_at at time zone 'Asia/Jakarta')::date = s.d
    )
  ) order by s.d)
  into v_days
  from (select v_today - k as d from generate_series(6, 0, -1) as k) s;

  return jsonb_build_object(
    'today', v_today,
    'package', v_package,
    'mine', v_mine,
    'streak', jsonb_build_object('current', v_current, 'best', v_best),
    'days', coalesce(v_days, '[]'::jsonb)
  );
end
$$;

create or replace function public.get_news(p_limit integer default 50)
returns table (
  id uuid, title text, summary text, source_name text, source_url text, track text, published_on date
)
language sql stable security definer set search_path = public
as $$
  select n.id, n.title, n.summary, n.source_name, n.source_url, n.track, n.published_on
  from news n
  order by n.published_on desc, n.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 200);
$$;

grant execute on function
  public.get_catalog(uuid, text),
  public.get_exam_for_taking(uuid),
  public.submit_attempt(uuid, jsonb, text, uuid, text),
  public.get_leaderboard(uuid),
  public.get_attempt_review(uuid, uuid, text),
  public.get_daily(uuid, text),
  public.get_news(integer)
to anon, authenticated;

-- ============ SAMPLE PACKAGE ============
-- "Paket Harian SKD #1": twelve original SKD-style questions with explanations,
-- scheduled for the day this migration runs (unless that day already has one).
do $seed$
declare
  v_exam uuid;
begin
  if exists (select 1 from public.exams where title = $q$Paket Harian SKD #1$q$) then
    return;
  end if;

  insert into public.exams (title, description, duration_minutes, track, daily_date)
  values (
    $q$Paket Harian SKD #1$q$,
    $q$12 soal SKD CPNS: 5 TWK dan 7 TIU. Paket contoh dari lulustes, lengkap dengan pembahasan tiap soal.$q$,
    15,
    'cpns',
    case
      when exists (select 1 from public.exams where daily_date = public.today_wib()) then null
      else public.today_wib()
    end
  )
  returning id into v_exam;

  insert into public.questions (exam_id, order_index, kind, section, text, options, answer, explanation)
  values
    (v_exam, 1, 'single', 'TWK',
      $q$Lambang pohon beringin pada perisai Garuda Pancasila melambangkan sila …$q$,
      $q$["Ketuhanan Yang Maha Esa","Kemanusiaan yang adil dan beradab","Persatuan Indonesia","Kerakyatan yang dipimpin oleh hikmat kebijaksanaan dalam permusyawaratan/perwakilan","Keadilan sosial bagi seluruh rakyat Indonesia"]$q$::jsonb,
      '"c"'::jsonb,
      $q$Pohon beringin melambangkan sila ketiga, Persatuan Indonesia: batangnya kokoh dan akarnya menjalar ke mana-mana, seperti persatuan bangsa yang beragam.
Lambang sila lainnya: bintang (sila 1), rantai (sila 2), kepala banteng (sila 4), serta padi dan kapas (sila 5).$q$),
    (v_exam, 2, 'single', 'TWK',
      $q$Rumusan Pancasila sebagai dasar negara yang disahkan PPKI pada 18 Agustus 1945 tercantum dalam …$q$,
      $q$["Pembukaan UUD 1945 alinea pertama","Pembukaan UUD 1945 alinea kedua","Pembukaan UUD 1945 alinea ketiga","Pembukaan UUD 1945 alinea keempat","Pasal 1 UUD 1945"]$q$::jsonb,
      '"d"'::jsonb,
      $q$Rumusan Pancasila yang sah ada di Pembukaan UUD 1945 alinea keempat, yang disahkan PPKI pada 18 Agustus 1945.
Alinea pertama menyatakan kemerdekaan adalah hak segala bangsa, alinea kedua tentang perjuangan pergerakan kemerdekaan, dan alinea ketiga berisi pernyataan kemerdekaan atas berkat rahmat Allah.$q$),
    (v_exam, 3, 'single', 'TWK',
      $q$Menurut Pasal 1 ayat (3) UUD NRI Tahun 1945, Negara Indonesia adalah …$q$,
      $q$["negara kesatuan yang berbentuk republik","negara hukum","negara kepulauan yang berciri Nusantara","negara yang kedaulatannya berada di tangan rakyat","negara yang berdasar atas Ketuhanan Yang Maha Esa"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Pasal 1 ayat (3) berbunyi "Negara Indonesia adalah negara hukum" (hasil perubahan ketiga, 2001).
Pilihan lain juga ada di UUD, tetapi di pasal berbeda: negara kesatuan berbentuk republik di Pasal 1 ayat (1), kedaulatan di tangan rakyat di Pasal 1 ayat (2), negara kepulauan berciri Nusantara di Pasal 25A, dan negara berdasar atas Ketuhanan Yang Maha Esa di Pasal 29 ayat (1).$q$),
    (v_exam, 4, 'single', 'TWK',
      $q$Semboyan Bhinneka Tunggal Ika dikutip dari kitab …$q$,
      $q$["Negarakertagama karya Mpu Prapanca","Sutasoma karya Mpu Tantular","Arjunawiwaha karya Mpu Kanwa","Pararaton","Bharatayuddha karya Mpu Sedah dan Mpu Panuluh"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Bhinneka Tunggal Ika berasal dari kitab Sutasoma karya Mpu Tantular pada masa Majapahit. Kalimat lengkapnya "Bhinneka tunggal ika tan hana dharma mangrwa": berbeda-beda tetapi tetap satu, tidak ada kebenaran yang mendua.$q$),
    (v_exam, 5, 'single', 'TWK',
      $q$Ikrar Sumpah Pemuda dibacakan pada akhir Kongres Pemuda II tanggal …$q$,
      $q$["20 Mei 1908","28 Oktober 1928","1 Juni 1945","17 Agustus 1945","10 November 1945"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Sumpah Pemuda diikrarkan pada 28 Oktober 1928 di akhir Kongres Pemuda II di Batavia.
Tanggal lainnya: 20 Mei 1908 berdirinya Budi Utomo (Hari Kebangkitan Nasional), 1 Juni 1945 pidato Soekarno tentang dasar negara di sidang BPUPKI, 17 Agustus 1945 Proklamasi, dan 10 November 1945 pertempuran Surabaya (Hari Pahlawan).$q$),
    (v_exam, 6, 'single', 'TIU',
      $q$2, 6, 12, 20, 30, …
Bilangan berikutnya adalah …$q$,
      $q$["38","40","42","44","48"]$q$::jsonb,
      '"c"'::jsonb,
      $q$Selisih antarsuku bertambah 2: +4, +6, +8, +10, lalu +12. Jadi 30 + 12 = 42.
Cara lain: polanya n × (n + 1), yaitu 1×2, 2×3, 3×4, 4×5, 5×6, sehingga suku keenam 6×7 = 42.$q$),
    (v_exam, 7, 'single', 'TIU',
      $q$3, 5, 9, 17, 33, …
Bilangan berikutnya adalah …$q$,
      $q$["49","57","63","65","66"]$q$::jsonb,
      '"d"'::jsonb,
      $q$Setiap suku sama dengan suku sebelumnya × 2 − 1: 3×2−1 = 5, 5×2−1 = 9, 9×2−1 = 17, 17×2−1 = 33, maka 33×2−1 = 65.
Bisa juga dilihat dari selisihnya yang berlipat dua: +2, +4, +8, +16, lalu +32.$q$),
    (v_exam, 8, 'single', 'TIU',
      $q$DOKTER : PASIEN = GURU : …$q$,
      $q$["Sekolah","Murid","Kelas","Buku","Pelajaran"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Hubungannya adalah pemberi layanan dan orang yang dilayani: dokter merawat pasien, guru mengajar murid.
Sekolah dan kelas adalah tempat, buku adalah alat, dan pelajaran adalah isi yang diajarkan, bukan orang yang dilayani.$q$),
    (v_exam, 9, 'single', 'TIU',
      $q$Semua pegawai yang disiplin mendapat bonus.
Andi tidak mendapat bonus.
Kesimpulan yang tepat adalah …$q$,
      $q$["Andi pegawai yang disiplin","Andi bukan pegawai yang disiplin","Andi mungkin pegawai yang disiplin","Semua pegawai mendapat bonus","Tidak dapat ditarik kesimpulan"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Polanya modus tollens: jika p maka q; tidak q; maka tidak p.
Di sini p = pegawai yang disiplin dan q = mendapat bonus. Karena Andi tidak mendapat bonus, Andi pasti bukan pegawai yang disiplin.$q$),
    (v_exam, 10, 'single', 'TIU',
      $q$Suatu pekerjaan dapat diselesaikan 6 orang dalam 12 hari. Jika dikerjakan 9 orang dengan kemampuan yang sama, pekerjaan itu selesai dalam … hari.$q$,
      $q$["6","7","8","9","10"]$q$::jsonb,
      '"c"'::jsonb,
      $q$Ini perbandingan berbalik nilai: makin banyak orang, makin singkat waktunya.
Beban kerjanya 6 × 12 = 72 orang-hari. Dengan 9 orang: 72 ÷ 9 = 8 hari.$q$),
    (v_exam, 11, 'single', 'TIU',
      $q$Harga sebuah tas Rp250.000. Toko memberi diskon 20%, lalu diskon tambahan 10% dari harga setelah diskon pertama. Harga yang harus dibayar adalah …$q$,
      $q$["Rp175.000","Rp180.000","Rp182.500","Rp187.500","Rp200.000"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Diskon bertingkat dihitung berurutan, bukan dijumlah.
Setelah diskon 20%: 250.000 × 80% = 200.000. Setelah diskon 10%: 200.000 × 90% = 180.000.
Kalau kedua diskon dijumlah menjadi 30%, hasilnya Rp175.000. Itu jebakan yang paling sering dipilih.$q$),
    (v_exam, 12, 'single', 'TIU',
      $q$Sinonim kata AMBIGU adalah …$q$,
      $q$["Pasti","Taksa","Tegas","Lugas","Rinci"]$q$::jsonb,
      '"b"'::jsonb,
      $q$Ambigu berarti bermakna lebih dari satu sehingga bisa ditafsirkan berbeda. Padanannya dalam KBBI adalah taksa.
Pasti, tegas, lugas, dan rinci justru dekat dengan makna sebaliknya: jelas dan tidak mendua.$q$);
end
$seed$;

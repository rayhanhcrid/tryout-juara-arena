-- Public, account-free participation.
-- Participants are guests (a name plus a secret key kept in their browser);
-- everything they need goes through SECURITY DEFINER functions callable with
-- the publishable key, so the app works without the service-role secret and
-- answer keys never leave the database. Every statement is idempotent.

-- ============ STORAGE: question images bucket (was missing) ============
insert into storage.buckets (id, name, public)
values ('exam-images', 'exam-images', false)
on conflict (id) do nothing;

do $$ begin
  create policy "Anyone can view exam images"
  on storage.objects for select to anon
  using (bucket_id = 'exam-images');
exception when duplicate_object then null;
end $$;

-- ============ GUESTS ============
create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  key_hash text not null,
  created_at timestamptz not null default now()
);
alter table public.guests enable row level security;
grant all on public.guests to service_role;
-- No grants or policies for anon/authenticated: only the functions below read it.

-- ============ ATTEMPTS: an account OR a guest ============
alter table public.attempts alter column user_id drop not null;
alter table public.attempts add column if not exists guest_id uuid references public.guests(id) on delete cascade;
do $$ begin
  alter table public.attempts
    add constraint attempts_one_participant check ((user_id is null) <> (guest_id is null));
exception when duplicate_object then null;
end $$;
create index if not exists attempts_guest_idx on public.attempts (guest_id);

-- ============ FUNCTIONS ============
create or replace function public.guest_key_ok(p_guest_id uuid, p_guest_key text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from guests g
    where g.id = p_guest_id
      and g.key_hash = encode(sha256(convert_to(coalesce(p_guest_key, ''), 'UTF8')), 'hex')
  );
$$;
revoke all on function public.guest_key_ok(uuid, text) from public, anon, authenticated;

-- Catalog with counts; the guest's own best score when their key checks out.
create or replace function public.get_catalog(p_guest_id uuid default null, p_guest_key text default null)
returns table (
  id uuid, title text, description text, duration_minutes integer,
  question_count integer, attempt_count integer, my_best_score integer, my_best_total integer
)
language sql stable security definer set search_path = public
as $$
  with me as (
    select case when public.guest_key_ok(p_guest_id, p_guest_key) then p_guest_id end as gid
  )
  select e.id, e.title, e.description, e.duration_minutes,
    (select count(*)::int from questions q where q.exam_id = e.id),
    (select count(*)::int from attempts a where a.exam_id = e.id),
    b.sc, b.tt
  from exams e
  cross join me
  left join lateral (
    select a.score as sc, a.total as tt from attempts a
    where a.exam_id = e.id and me.gid is not null and a.guest_id = me.gid
    order by a.score desc, a.submitted_at asc
    limit 1
  ) b on true
  order by e.created_at;
$$;

-- One exam and its questions, without the answer keys.
create or replace function public.get_exam_for_taking(p_exam_id uuid)
returns jsonb
language sql stable security definer set search_path = public
as $$
  select jsonb_build_object(
    'exam', jsonb_build_object(
      'id', e.id, 'title', e.title, 'description', e.description,
      'duration_minutes', e.duration_minutes
    ),
    'questions', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', q.id, 'text', q.text, 'image_path', q.image_path,
        'option_a', q.option_a, 'option_b', q.option_b,
        'option_c', q.option_c, 'option_d', q.option_d
      ) order by q.order_index)
      from questions q where q.exam_id = e.id
    ), '[]'::jsonb)
  )
  from exams e
  where e.id = p_exam_id;
$$;

-- Grade inside the database and record the attempt under a guest. A valid
-- (guest id, key) pair reuses that guest; otherwise a new guest is created.
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

  select count(*)::int into v_total from questions q where q.exam_id = p_exam_id;
  if v_total = 0 then
    raise exception 'Soal ujian tidak ditemukan.' using errcode = 'P0002';
  end if;

  select coalesce(jsonb_object_agg(q.id::text, p_answers ->> q.id::text), '{}'::jsonb),
         (count(*) filter (where (p_answers ->> q.id::text) = q.correct_option))::int
    into v_clean, v_score
  from questions q
  where q.exam_id = p_exam_id
    and (p_answers ->> q.id::text) in ('a', 'b', 'c', 'd');

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

-- Best attempt per participant (accounts and guests); ties go to the earlier submission.
create or replace function public.get_leaderboard(p_exam_id uuid)
returns table (
  rank integer, participant_id uuid, nama text, score integer, total integer, submitted_at timestamptz
)
language sql stable security definer set search_path = public
as $$
  with best as (
    select distinct on (coalesce(a.user_id, a.guest_id))
      coalesce(a.user_id, a.guest_id) as pid,
      coalesce(nullif(g.nama, ''), nullif(p.nama, ''), p.username, 'Peserta') as nm,
      a.score as sc, a.total as tt, a.submitted_at as at
    from attempts a
    left join profiles p on p.id = a.user_id
    left join guests g on g.id = a.guest_id
    where a.exam_id = p_exam_id
    order by coalesce(a.user_id, a.guest_id), a.score desc, a.submitted_at asc
  )
  select (row_number() over (order by b.sc desc, b.at asc))::int, b.pid, b.nm, b.sc, b.tt, b.at
  from best b
  order by b.sc desc, b.at asc;
$$;

-- A guest's own attempts at one exam, newest first.
create or replace function public.get_my_attempts(p_exam_id uuid, p_guest_id uuid, p_guest_key text)
returns table (id uuid, score integer, total integer, submitted_at timestamptz)
language sql stable security definer set search_path = public
as $$
  select a.id, a.score, a.total, a.submitted_at
  from attempts a
  where a.exam_id = p_exam_id
    and a.guest_id = p_guest_id
    and public.guest_key_ok(p_guest_id, p_guest_key)
  order by a.submitted_at desc;
$$;

grant execute on function
  public.get_catalog(uuid, text),
  public.get_exam_for_taking(uuid),
  public.submit_attempt(uuid, jsonb, text, uuid, text),
  public.get_leaderboard(uuid),
  public.get_my_attempts(uuid, uuid, text)
to anon, authenticated;

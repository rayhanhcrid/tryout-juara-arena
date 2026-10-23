-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  nama text not null default '',
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Anyone can view profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create profile on signup (username & nama from signup metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, nama)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user' || substr(replace(new.id::text, '-', ''), 1, 10)),
    coalesce(new.raw_user_meta_data->>'nama', '')
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============ EXAMS ============
create table public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  duration_minutes integer not null default 60 check (duration_minutes > 0),
  created_at timestamptz not null default now()
);
grant select on public.exams to authenticated;
grant all on public.exams to service_role;
alter table public.exams enable row level security;
create policy "Authenticated can view exams" on public.exams for select to authenticated using (true);

-- ============ QUESTIONS ============
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  order_index integer not null default 0,
  text text not null,
  image_path text,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d'))
);
grant select on public.questions to authenticated;
grant all on public.questions to service_role;
alter table public.questions enable row level security;
create policy "Authenticated can view questions" on public.questions for select to authenticated using (true);
create index questions_exam_order_idx on public.questions (exam_id, order_index);

-- ============ ATTEMPTS ============
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  score integer not null default 0,
  total integer not null default 0,
  submitted_at timestamptz not null default now()
);
grant select, insert on public.attempts to authenticated;
grant all on public.attempts to service_role;
alter table public.attempts enable row level security;
create policy "Authenticated can view attempts" on public.attempts for select to authenticated using (true);
create policy "Users can insert own attempts" on public.attempts for insert to authenticated with check (auth.uid() = user_id);
create index attempts_exam_score_idx on public.attempts (exam_id, score desc);

-- ============ STORAGE (exam-images, private) ============
create policy "Authenticated can view exam images"
on storage.objects for select to authenticated
using (bucket_id = 'exam-images');

-- ============ SAMPLE DATA ============
insert into public.exams (id, title, description, duration_minutes) values
  ('11111111-1111-1111-1111-111111111111', 'Try Out Matematika Dasar', 'Contoh katalog try out materi matematika dasar: aritmatika, aljabar, dan geometri sederhana.', 30);

insert into public.questions (exam_id, order_index, text, option_a, option_b, option_c, option_d, correct_option) values
  ('11111111-1111-1111-1111-111111111111', 1, 'Hasil dari 12 + 8 x 2 adalah ...', '40', '28', '30', '32', 'b'),
  ('11111111-1111-1111-1111-111111111111', 2, 'Jika x + 5 = 12, maka nilai x adalah ...', '5', '6', '7', '8', 'c'),
  ('11111111-1111-1111-1111-111111111111', 3, 'Luas persegi dengan sisi 7 cm adalah ...', '14 cm2', '28 cm2', '42 cm2', '49 cm2', 'd'),
  ('11111111-1111-1111-1111-111111111111', 4, '25% dari 200 adalah ...', '25', '50', '75', '100', 'b'),
  ('11111111-1111-1111-1111-111111111111', 5, 'Nilai dari 3 pangkat 3 adalah ...', '6', '9', '27', '81', 'c');
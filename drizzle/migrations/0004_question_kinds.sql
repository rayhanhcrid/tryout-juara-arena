-- Question forms beyond four-option multiple choice, as in the TKA:
--   single    Pilihan ganda: 2–6 options, key is one letter ("b").
--   multiple  Pilihan ganda kompleks: 2–6 options, key is an array of letters.
--   category  Kategori: 1–8 statements, 2–3 categories (Benar/Salah…), key is
--             one category index per statement.
-- Options move from option_a..option_d into one `options` array and the key
-- into `answer`; existing questions become `single`. Grading stays in the
-- database. Mirrors src/lib/question-kinds.ts. Idempotent.

alter table public.questions add column if not exists kind text not null default 'single';
alter table public.questions add column if not exists options jsonb;
alter table public.questions add column if not exists categories jsonb;
alter table public.questions add column if not exists answer jsonb;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'questions' and column_name = 'option_a'
  ) then
    execute $sql$
      update public.questions
      set options = jsonb_build_array(option_a, option_b, option_c, option_d),
          answer = to_jsonb(correct_option)
      where options is null
    $sql$;
  end if;
end
$$;

-- Letters available to a question with p_n options.
create or replace function public.option_letters(p_n integer)
returns text
language sql immutable
as $$ select left('abcdef', greatest(p_n, 0)) $$;

-- True when every element of a jsonb array is a non-blank string. Callers
-- check that p_arr is an array first.
create or replace function public.all_nonblank_strings(p_arr jsonb)
returns boolean
language sql immutable
as $$
  select not exists (
    select 1 from jsonb_array_elements(p_arr) e
    where jsonb_typeof(e) <> 'string' or btrim(e #>> '{}') = ''
  )
$$;

-- Nested CASEs (not AND) so no array function ever sees a non-array.
create or replace function public.question_shape_ok(
  p_kind text, p_options jsonb, p_categories jsonb, p_answer jsonb
)
returns boolean
language sql immutable
as $$
  select coalesce(case
    when jsonb_typeof(p_options) is distinct from 'array' then false
    when not public.all_nonblank_strings(p_options) then false
    when p_kind in ('single', 'multiple') then case
      when jsonb_array_length(p_options) not between 2 and 6 then false
      when p_categories is not null then false
      when p_kind = 'single' then case
        when jsonb_typeof(p_answer) is distinct from 'string' then false
        else char_length(p_answer #>> '{}') = 1
          and position(p_answer #>> '{}' in public.option_letters(jsonb_array_length(p_options))) > 0
      end
      when jsonb_typeof(p_answer) is distinct from 'array' then false
      when jsonb_array_length(p_answer) < 1 then false
      else not exists (
          select 1 from jsonb_array_elements(p_answer) a
          where jsonb_typeof(a) <> 'string'
            or char_length(a #>> '{}') <> 1
            or position(a #>> '{}' in public.option_letters(jsonb_array_length(p_options))) = 0
        )
        and (select count(distinct a) from jsonb_array_elements_text(p_answer) a)
          = jsonb_array_length(p_answer)
    end
    when p_kind = 'category' then case
      when jsonb_array_length(p_options) not between 1 and 8 then false
      when jsonb_typeof(p_categories) is distinct from 'array' then false
      when jsonb_array_length(p_categories) not between 2 and 3 then false
      when not public.all_nonblank_strings(p_categories) then false
      when jsonb_typeof(p_answer) is distinct from 'array' then false
      when jsonb_array_length(p_answer) <> jsonb_array_length(p_options) then false
      else not exists (
        select 1 from jsonb_array_elements(p_answer) a
        where jsonb_typeof(a) <> 'number'
          or (a #>> '{}') !~ '^[0-9]$'
          or (a #>> '{}')::int >= jsonb_array_length(p_categories)
      )
    end
    else false
  end, false)
$$;

alter table public.questions alter column options set not null;
alter table public.questions alter column answer set not null;

alter table public.questions drop constraint if exists questions_kind_check;
alter table public.questions
  add constraint questions_kind_check check (kind in ('single', 'multiple', 'category'));
alter table public.questions drop constraint if exists questions_shape_check;
alter table public.questions
  add constraint questions_shape_check
  check (public.question_shape_ok(kind, options, categories, answer));

alter table public.questions
  drop column if exists option_a,
  drop column if exists option_b,
  drop column if exists option_c,
  drop column if exists option_d,
  drop column if exists correct_option;

-- What a participant sent for one question, reduced to a valid answer or null:
-- a letter; a sorted set of letters; or a category index (or null) per statement.
create or replace function public.clean_answer(
  p_kind text, p_options jsonb, p_categories jsonb, p_raw jsonb
)
returns jsonb
language sql immutable
as $$
  select case
    when p_raw is null then null
    when p_kind = 'single' then
      case
        when jsonb_typeof(p_raw) = 'string'
          and char_length(p_raw #>> '{}') = 1
          and position(p_raw #>> '{}' in public.option_letters(jsonb_array_length(p_options))) > 0
        then p_raw
      end
    when p_kind = 'multiple' then
      case when jsonb_typeof(p_raw) = 'array' then (
        select jsonb_agg(distinct x order by x)
        from jsonb_array_elements_text(p_raw) x
        where char_length(x) = 1
          and position(x in public.option_letters(jsonb_array_length(p_options))) > 0
      ) end
    when p_kind = 'category' then
      case
        when jsonb_typeof(p_raw) is distinct from 'array' then null
        when jsonb_array_length(p_raw) = jsonb_array_length(p_options) then (
          select case when bool_or(v is not null) then jsonb_agg(coalesce(v, 'null'::jsonb) order by i) end
          from (
            select t.i,
              case
                when jsonb_typeof(t.a) = 'number'
                  and (t.a #>> '{}') ~ '^[0-9]$'
                  and (t.a #>> '{}')::int < jsonb_array_length(p_categories)
                then t.a
              end as v
            from jsonb_array_elements(p_raw) with ordinality t(a, i)
          ) rows
        )
      end
  end
$$;

-- A cleaned answer earns the point only when it matches the key in full.
create or replace function public.answer_correct(p_kind text, p_key jsonb, p_given jsonb)
returns boolean
language sql immutable
as $$
  select coalesce(
    case p_kind
      when 'multiple' then
        (select jsonb_agg(x order by x) from jsonb_array_elements_text(p_key) x) = p_given
      else p_key = p_given
    end,
    false
  )
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
        'id', q.id, 'kind', q.kind, 'text', q.text, 'image_path', q.image_path,
        'options', q.options, 'categories', q.categories,
        -- Read by builds from before question kinds; safe to drop once those are gone.
        'option_a', q.options ->> 0, 'option_b', q.options ->> 1,
        'option_c', q.options ->> 2, 'option_d', q.options ->> 3
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

grant execute on function
  public.get_exam_for_taking(uuid),
  public.submit_attempt(uuid, jsonb, text, uuid, text)
to anon, authenticated;

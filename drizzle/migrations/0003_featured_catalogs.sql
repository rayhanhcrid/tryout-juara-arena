-- Catalogs the admin pins come first, in the catalog and on the landing rail;
-- the rest keep their creation order. TKA Geografi 2025 starts pinned.
-- Idempotent.

alter table public.exams add column if not exists featured boolean not null default false;

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
  order by e.featured desc, e.created_at;
$$;

update public.exams set featured = true
where title = 'TKA Geografi 2025' and not featured;

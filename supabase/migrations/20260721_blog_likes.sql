create table if not exists public.blog_like_counts (
  blog_id text primary key references public.blogs(id) on delete cascade,
  like_count bigint not null default 0 check (like_count >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_votes (
  blog_id text not null references public.blogs(id) on delete cascade,
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (blog_id, voter_id)
);

insert into public.blog_like_counts (blog_id, like_count)
select id, 0
from public.blogs
on conflict on constraint blog_like_counts_pkey do nothing;

alter table public.blog_like_counts enable row level security;
alter table public.blog_votes enable row level security;

drop policy if exists "Public can read blog like counts" on public.blog_like_counts;
create policy "Public can read blog like counts"
on public.blog_like_counts
for select
to anon, authenticated
using (true);

create or replace function public.toggle_blog_like(
  p_blog_id text,
  p_voter_id uuid,
  p_liked boolean
)
returns table (
  blog_id text,
  like_count bigint,
  liked boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  affected_rows integer := 0;
  next_count bigint := 0;
begin
  if p_blog_id is null or p_voter_id is null then
    raise exception 'blog_id and voter_id are required';
  end if;

  if not exists (
    select 1
    from public.blogs as published_blog
    where published_blog.id = p_blog_id
      and published_blog.status = 'published'
  ) then
    raise exception 'Published blog not found';
  end if;

  insert into public.blog_like_counts (blog_id, like_count)
  values (p_blog_id, 0)
  on conflict on constraint blog_like_counts_pkey do nothing;

  if p_liked then
    insert into public.blog_votes (blog_id, voter_id)
    values (p_blog_id, p_voter_id)
    on conflict on constraint blog_votes_pkey do nothing;
    get diagnostics affected_rows = row_count;

    if affected_rows > 0 then
      update public.blog_like_counts as counts
      set like_count = counts.like_count + 1,
          updated_at = now()
      where counts.blog_id = p_blog_id
      returning counts.like_count into next_count;
    end if;
  else
    delete from public.blog_votes as votes
    where votes.blog_id = p_blog_id
      and votes.voter_id = p_voter_id;
    get diagnostics affected_rows = row_count;

    if affected_rows > 0 then
      update public.blog_like_counts as counts
      set like_count = greatest(0, counts.like_count - 1),
          updated_at = now()
      where counts.blog_id = p_blog_id
      returning counts.like_count into next_count;
    end if;
  end if;

  if affected_rows = 0 then
    select counts.like_count
    into next_count
    from public.blog_like_counts as counts
    where counts.blog_id = p_blog_id;
  end if;

  return query
  select
    p_blog_id,
    coalesce(next_count, 0),
    exists (
      select 1
      from public.blog_votes as votes
      where votes.blog_id = p_blog_id
        and votes.voter_id = p_voter_id
    );
end;
$$;

revoke all on function public.toggle_blog_like(text, uuid, boolean) from public;
grant execute on function public.toggle_blog_like(text, uuid, boolean) to anon, authenticated;

do $$
begin
  alter publication supabase_realtime add table public.blog_like_counts;
exception
  when duplicate_object then null;
end;
$$;

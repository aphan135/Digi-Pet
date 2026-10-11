create table if not exists public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  problem_id text not null,
  title text not null,
  topic text not null,
  type text not null check (type in ('leetcode', 'system-design', 'math', 'science')),
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  score numeric not null check (score between 0 and 10),
  is_correct boolean not null,
  missed_concepts text[] not null default '{}',
  at timestamptz not null,
  unique (user_id, problem_id, at)
);

create table if not exists public.problem_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  problem_id text not null,
  status text not null check (status in ('incomplete', 'completed')),
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

create or replace function public.update_problem_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.problem_progress (user_id, problem_id, status)
  values (new.user_id, new.problem_id, case when new.is_correct then 'completed' else 'incomplete' end)
  on conflict (user_id, problem_id) do update
  set status = case when problem_progress.status = 'completed' then 'completed' else excluded.status end,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists attempts_update_progress on public.attempts;
create trigger attempts_update_progress
after insert on public.attempts
for each row execute function public.update_problem_progress();

alter table public.attempts enable row level security;
alter table public.problem_progress enable row level security;

drop policy if exists attempts_select on public.attempts;
create policy attempts_select on public.attempts for select to authenticated
using (auth.uid() = user_id);

drop policy if exists attempts_insert on public.attempts;
create policy attempts_insert on public.attempts for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists problem_progress_select on public.problem_progress;
create policy problem_progress_select on public.problem_progress for select to authenticated
using (auth.uid() = user_id);

drop policy if exists problem_progress_insert on public.problem_progress;
create policy problem_progress_insert on public.problem_progress for insert to authenticated
with check (auth.uid() = user_id);

drop policy if exists problem_progress_update on public.problem_progress;
create policy problem_progress_update on public.problem_progress for update to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

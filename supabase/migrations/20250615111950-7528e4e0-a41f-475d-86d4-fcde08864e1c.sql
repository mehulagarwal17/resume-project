
-- 1. Create a storage bucket for resumes/files if it doesn't exist already
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- 2. Table for resume analysis
create table public.resume_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  file_url text not null,
  ats_score integer,
  feedback text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable row level security
alter table public.resume_scores enable row level security;

-- Allow users to manage their own resume scores
create policy "Users can view their own resume_scores"
  on resume_scores
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own resume_scores"
  on resume_scores
  for insert
  with check (user_id = auth.uid());

create policy "Users can update their own resume_scores"
  on resume_scores
  for update
  using (user_id = auth.uid());

create policy "Users can delete their own resume_scores"
  on resume_scores
  for delete
  using (user_id = auth.uid());

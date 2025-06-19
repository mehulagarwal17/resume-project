
-- Create the resume_scores table
CREATE TABLE public.resume_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_url text not null,
  ats_score integer,
  feedback text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable Row Level Security
ALTER TABLE public.resume_scores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users to manage their own resume scores
CREATE POLICY "Users can view their own resume_scores"
  ON public.resume_scores
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own resume_scores"
  ON public.resume_scores
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own resume_scores"
  ON public.resume_scores
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own resume_scores"
  ON public.resume_scores
  FOR DELETE
  USING (user_id = auth.uid());

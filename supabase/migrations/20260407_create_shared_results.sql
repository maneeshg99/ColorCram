-- Shared game results for challenge links
create table if not exists shared_results (
  id text primary key, -- short random ID for the URL
  user_id uuid references auth.users(id),
  mode text not null,
  difficulty text not null,
  avg_score integer not null,
  total_score integer not null,
  rounds_played integer not null,
  rounds_data jsonb not null, -- array of { target: HSB, guess: HSB, score: number }
  created_at timestamptz default now()
);

-- Allow anyone to read shared results (public challenge links)
alter table shared_results enable row level security;

create policy "Anyone can read shared results"
  on shared_results for select
  using (true);

create policy "Authenticated users can insert shared results"
  on shared_results for insert
  with check (auth.uid() = user_id or user_id is null);

-- Index for fast lookups by ID
create index if not exists shared_results_id_idx on shared_results(id);

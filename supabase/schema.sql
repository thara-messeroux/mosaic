-- ============================================================
-- Mosaic MVP schema — profiles, reflections, challenges,
-- decisions, and profile-photos storage. Safe to re-run.
-- ============================================================

create extension if not exists pgcrypto; -- for gen_random_uuid()

-- ---------- profiles (real users + 6 public samples) ----------
create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  is_sample        boolean not null default false,
  slug             text unique,               -- stable key for sample rows
  first_name       text,
  age              int,
  city             text,
  country          text,
  originally_from  text,
  intent           text,
  connection_style text,
  values           text[] not null default '{}',
  prompt_question  text,
  prompt_answer    text,
  photo_url        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- a row is either a real user's profile OR an ownerless sample
  constraint profiles_owner_check check (
    (is_sample and user_id is null) or (not is_sample and user_id is not null)
  )
);
-- one profile per real user (samples keep user_id null)
create unique index if not exists profiles_user_id_key
  on public.profiles(user_id) where user_id is not null;
create index if not exists profiles_is_sample_idx on public.profiles(is_sample);

-- ---------- reflections (private; lens is a placeholder) ----------
-- NOTE: real AI output will live in a future connection_lenses table
-- referencing reflections(id). The lens column here is temporary.
create table if not exists public.reflections (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  prompt     text not null,
  body       text not null,
  lens       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists reflections_user_id_idx on public.reflections(user_id);

-- ---------- challenges (own + seeded samples) ----------
create table if not exists public.challenges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  is_sample   boolean not null default false,
  slug        text unique,
  title       text not null,
  category    text,
  description text,
  duration    text,
  created_at  timestamptz not null default now(),
  constraint challenges_owner_check check (
    (is_sample and user_id is null) or (not is_sample and user_id is not null)
  )
);
create index if not exists challenges_user_id_idx on public.challenges(user_id);
create index if not exists challenges_is_sample_idx on public.challenges(is_sample);

-- ---------- profile_decisions (Discover Save / Pass) ----------
create table if not exists public.profile_decisions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  decision   text not null check (decision in ('save','pass')),
  created_at timestamptz not null default now(),
  -- one decision per user per profile
  unique (user_id, profile_id)
);
create index if not exists profile_decisions_user_id_idx  on public.profile_decisions(user_id);
create index if not exists profile_decisions_profile_idx  on public.profile_decisions(profile_id);

-- ============================================================
-- updated_at auto-touch trigger (profiles, reflections)
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.reflections;
create trigger set_updated_at before update on public.reflections
  for each row execute function public.set_updated_at();

-- ============================================================
-- Authenticated app permissions
-- Table-level grants for the signed-in role. RLS below still constrains
-- every row; these grants just allow the operations to be attempted.
-- ============================================================
grant select, insert, update, delete on public.profiles          to authenticated;
grant select, insert, update, delete on public.reflections        to authenticated;
grant select, insert, update, delete on public.challenges         to authenticated;
grant select, insert, update, delete on public.profile_decisions  to authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.reflections       enable row level security;
alter table public.challenges        enable row level security;
alter table public.profile_decisions enable row level security;

-- ---------- profiles policies ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (is_sample or user_id = auth.uid());

drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (user_id = auth.uid() and not is_sample);

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete using (user_id = auth.uid());

-- ---------- reflections policies (fully private) ----------
drop policy if exists reflections_select on public.reflections;
create policy reflections_select on public.reflections
  for select using (user_id = auth.uid());

drop policy if exists reflections_insert on public.reflections;
create policy reflections_insert on public.reflections
  for insert with check (user_id = auth.uid());

drop policy if exists reflections_update on public.reflections;
create policy reflections_update on public.reflections
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reflections_delete on public.reflections;
create policy reflections_delete on public.reflections
  for delete using (user_id = auth.uid());

-- ---------- challenges policies ----------
drop policy if exists challenges_select on public.challenges;
create policy challenges_select on public.challenges
  for select using (is_sample or user_id = auth.uid());

drop policy if exists challenges_insert on public.challenges;
create policy challenges_insert on public.challenges
  for insert with check (user_id = auth.uid() and not is_sample);

drop policy if exists challenges_delete on public.challenges;
create policy challenges_delete on public.challenges
  for delete using (user_id = auth.uid());

-- users may edit only their own non-sample challenges
drop policy if exists challenges_update on public.challenges;
create policy challenges_update on public.challenges
  for update using (user_id = auth.uid() and not is_sample)
  with check (user_id = auth.uid() and not is_sample);

-- ---------- profile_decisions policies ----------
drop policy if exists decisions_select on public.profile_decisions;
create policy decisions_select on public.profile_decisions
  for select using (user_id = auth.uid());

drop policy if exists decisions_insert on public.profile_decisions;
create policy decisions_insert on public.profile_decisions
  for insert with check (user_id = auth.uid());

drop policy if exists decisions_update on public.profile_decisions;
create policy decisions_update on public.profile_decisions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists decisions_delete on public.profile_decisions;
create policy decisions_delete on public.profile_decisions
  for delete using (user_id = auth.uid());

-- ============================================================
-- Seed data — 6 public sample profiles (idempotent via slug)
-- ============================================================
insert into public.profiles
  (is_sample, slug, first_name, age, city, country, originally_from,
   intent, connection_style, values, prompt_question, prompt_answer, photo_url)
values
  (true, 'amara', 'Amara', 31, 'Lisbon', 'Portugal', 'Cape Verde',
   'Long-term, friendship first', 'Slow and steady',
   array['Curiosity','Kindness','Emotional honesty']::text[],
   'A friendship becomes something more when…',
   'we can be quiet together and still feel completely at ease — no performance, just presence.',
   'https://images.pexels.com/photos/29282975/pexels-photo-29282975.jpeg'),
  (true, 'diego', 'Diego', 34, 'Toronto', 'Canada', 'Brazil',
   'Open to romance, no rush', 'Warm and open',
   array['Playfulness','Loyalty','Growth']::text[],
   'The best kind of Sunday is…',
   'a long walk, an unhurried coffee, and a conversation that loses track of time.',
   'https://images.unsplash.com/photo-1779497056298-51a5453cbb7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'),
  (true, 'naomi', 'Naomi', 29, 'Chicago', 'United States', 'United States',
   'Building deep friendship', 'Thoughtful and reserved',
   array['Creativity','Emotional honesty','Calm']::text[],
   'I feel most myself when…',
   'I''m making something with my hands and someone I trust is nearby, doing their own thing.',
   'https://images.unsplash.com/photo-1770853800316-911f5a248785?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'),
  (true, 'jeanluc', 'Jean-Luc', 37, 'Paris', 'France', 'Haiti',
   'Long-term, friendship first', 'Warm and open',
   array['Loyalty','Generosity','Curiosity']::text[],
   'Something small that means a lot to me…',
   'cooking for the people I love. It''s how I say the things I don''t have words for.',
   'https://images.unsplash.com/photo-1779497055853-478ac423fee7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'),
  (true, 'chloe', 'Chloé', 32, 'Montréal', 'Canada', 'France',
   'Open to romance, no rush', 'Playful and light',
   array['Adventure','Kindness','Growth']::text[],
   'I''m hoping to find someone who…',
   'is curious about the world and gentle with people — including themselves.',
   'https://images.unsplash.com/photo-1761046543296-5c3c6abe0db1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'),
  (true, 'kwame', 'Kwame', 35, 'Boston', 'United States', 'South Africa',
   'Building deep friendship', 'Thoughtful and reserved',
   array['Emotional honesty','Calm','Trust']::text[],
   'A friendship becomes something more when…',
   'there''s enough trust to be unsure out loud, and still feel held.',
   'https://images.unsplash.com/photo-1779497056303-cd127f31df94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080')
on conflict (slug) do nothing;

-- ---------- Seed sample challenges ----------
insert into public.challenges
  (is_sample, slug, title, category, description, duration)
values
  (true, 'unhurried-question', 'The unhurried question', 'Curiosity',
   'Ask someone one question you''re genuinely curious about — and really listen to the answer.',
   '1 day'),
  (true, 'say-the-true-thing', 'Say the true thing', 'Honesty',
   'Practice sharing one honest feeling you''d normally keep to yourself.',
   '3 days'),
  (true, 'week-of-small-kindnesses', 'A week of small kindnesses', 'Kindness',
   'Offer one small, unprompted kindness each day. Notice how it changes your week.',
   '7 days')
on conflict (slug) do nothing;

-- ============================================================
-- Storage — public-read profile-photos bucket + owner policies
-- ============================================================
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

-- anyone can view photos (bucket is public)
drop policy if exists profile_photos_read on storage.objects;
create policy profile_photos_read on storage.objects
  for select using (bucket_id = 'profile-photos');

-- authenticated users may write only inside their own auth.uid()/ folder
drop policy if exists profile_photos_insert on storage.objects;
create policy profile_photos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_photos_update on storage.objects;
create policy profile_photos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists profile_photos_delete on storage.objects;
create policy profile_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Phase 4: AI Connection Lens + Sam usage guard
-- ============================================================

-- ---------- connection_lenses (one structured lens per reflection) ----------
create table if not exists public.connection_lenses (
  id            uuid primary key default gen_random_uuid(),
  reflection_id uuid not null references public.reflections(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  theme         text not null,
  values        text[] not null default '{}',
  prompt        text,
  model         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (reflection_id) -- regenerate updates the same row
);
create index if not exists connection_lenses_user_id_idx on public.connection_lenses(user_id);

alter table public.connection_lenses enable row level security;

grant select, insert, update, delete on public.connection_lenses to authenticated;

drop policy if exists connection_lenses_select on public.connection_lenses;
create policy connection_lenses_select on public.connection_lenses
  for select using (user_id = auth.uid());

drop policy if exists connection_lenses_insert on public.connection_lenses;
create policy connection_lenses_insert on public.connection_lenses
  for insert with check (user_id = auth.uid());

drop policy if exists connection_lenses_update on public.connection_lenses;
create policy connection_lenses_update on public.connection_lenses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists connection_lenses_delete on public.connection_lenses;
create policy connection_lenses_delete on public.connection_lenses
  for delete using (user_id = auth.uid());

drop trigger if exists set_updated_at on public.connection_lenses;
create trigger set_updated_at before update on public.connection_lenses
  for each row execute function public.set_updated_at();

-- ---------- ai_usage (per-user daily call counter) ----------
-- Written only by the Edge Function via the service-role key. RLS is enabled
-- with no client policies, so the browser can neither read nor write it.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day     date not null,
  count   int not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- The Edge Function's service-role client needs table access to count usage
-- (service_role bypasses RLS but still requires the grant). No grants to
-- anon/authenticated, so the browser has zero access.
grant select, insert, update on public.ai_usage to service_role;

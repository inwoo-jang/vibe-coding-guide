-- ═══════════════════════════════════════════════════════════════
--  바이브코딩 가이드 — 데이터베이스 전체 정의
--
--  쓰는 법: Supabase 대시보드 → SQL Editor 에 이 파일을 통째로 붙여넣고 Run.
--  여러 번 실행해도 안전하게 짜여 있습니다 (if not exists / drop policy if exists).
--
--  이 파일이 정답입니다. docs/04-데이터모델.md 와 어긋나면 문서 쪽을 고치세요.
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
--  1. profiles — auth.users 에 우리가 붙이는 정보
-- ───────────────────────────────────────────────────────────────
-- Supabase 가 관리하는 auth.users 는 직접 건드리지 않는 게 원칙이라
-- 별도 테이블을 만들어 1:1 로 붙입니다.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);


-- ───────────────────────────────────────────────────────────────
--  2. projects — 사용자가 만들려는 것
-- ───────────────────────────────────────────────────────────────
-- 이 가이드의 중심 단위입니다. 진도가 프로젝트에 매달립니다.
-- prd 는 AI가 뽑은 기획서를 통째로 담습니다. 모양이 자주 바뀔 값이라
-- 컬럼을 잘게 쪼개지 않고 jsonb 로 둡니다.

create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  one_liner   text,
  idea        text,
  prd         jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists projects_user_idx on public.projects (user_id, created_at desc);


-- ───────────────────────────────────────────────────────────────
--  3. progress — 프로젝트별 단계 완료 기록
-- ───────────────────────────────────────────────────────────────
-- 기본키가 (project_id, chapter_id) 복합키입니다.
-- ★ 한 프로젝트의 같은 챕터가 두 줄 생기는 게 DB 차원에서 불가능해집니다.
--   앱 코드로 중복을 막지 마세요. DB에게 시키는 쪽이 항상 더 안전합니다.
--
-- chapter_id 는 src/data/chapters.js 의 id ('setup', 'planning', ...) 입니다.
-- 챕터는 아직 DB에 없어서 FK 가 아니라 그냥 text 입니다.
-- ⚠️ chapters.js 에서 id 를 바꾸면 그 챕터의 진도가 끊깁니다. 바꾸지 마세요.

create table if not exists public.progress (
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  chapter_id  text not null,
  done        boolean not null default true,
  updated_at  timestamptz not null default now(),
  primary key (project_id, chapter_id)
);

create index if not exists progress_user_idx on public.progress (user_id);


-- ═══════════════════════════════════════════════════════════════
--  RLS — 여기부터가 진짜 보안입니다
-- ═══════════════════════════════════════════════════════════════
--
--  화면에서 남의 데이터를 안 보여주는 것으로는 부족합니다. 브라우저
--  개발자 도구를 열면 화면을 건너뛰고 DB에 직접 물어볼 수 있습니다.
--  RLS 는 DB가 직접 "이 사람이 이 줄을 봐도 되나"를 검사합니다.
--
--  RLS 를 켜면 기본이 "전부 거부"가 됩니다. 그게 안전한 출발점입니다.
--  필요한 것만 아래에서 하나씩 열어줍니다.

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.progress enable row level security;


-- ── 함정 ① 무한 재귀 ──────────────────────────────────────────
-- profiles 정책 안에서 profiles 를 select 하면, 그 조회에 또 정책이 걸리고,
-- 그 정책이 다시 조회하고... 무한 재귀로 에러가 납니다.
-- security definer 함수는 RLS 를 우회해서 확인하므로 이 고리를 끊습니다.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;


-- ── profiles ──────────────────────────────────────────────────
drop policy if exists "본인 프로필 읽기" on public.profiles;
create policy "본인 프로필 읽기" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "본인 프로필 수정" on public.profiles;
create policy "본인 프로필 수정" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "본인 프로필 생성" on public.profiles;
create policy "본인 프로필 생성" on public.profiles
  for insert with check (auth.uid() = id);


-- ── 함정 ② 권한 상승 (privilege escalation) ───────────────────
-- 위의 "본인 프로필 수정"만 있으면, 사용자가 자기 is_admin 을 true 로
-- 바꿔서 관리자가 됩니다. 조용하고 아주 흔한 사고입니다.
-- 정책만으로는 컬럼 단위를 막을 수 없어서 트리거로 되돌립니다.

create or replace function public.lock_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 관리자가 바꾸는 건 허용. 본인이 자기 걸 바꾸는 건 무시하고 원래 값으로.
  if new.is_admin is distinct from old.is_admin and not public.is_admin() then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists lock_is_admin_trigger on public.profiles;
create trigger lock_is_admin_trigger
  before update on public.profiles
  for each row execute function public.lock_is_admin();


-- ── projects ──────────────────────────────────────────────────
-- for all = select/insert/update/delete 전부.
-- using  = 기존 줄을 볼/고칠 수 있나
-- with check = 새로 넣는 줄이 조건을 지키나 (남의 이름으로 못 만들게)
drop policy if exists "본인 프로젝트" on public.projects;
create policy "본인 프로젝트" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "관리자 프로젝트 조회" on public.projects;
create policy "관리자 프로젝트 조회" on public.projects
  for select using (public.is_admin());


-- ── progress ──────────────────────────────────────────────────
drop policy if exists "본인 진도" on public.progress;
create policy "본인 진도" on public.progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "관리자 진도 조회" on public.progress;
create policy "관리자 진도 조회" on public.progress
  for select using (public.is_admin());


-- ═══════════════════════════════════════════════════════════════
--  가입하면 profiles 줄이 자동으로 생기게
-- ═══════════════════════════════════════════════════════════════
-- 이게 없으면 로그인은 되는데 profiles 에 줄이 없어서 모든 게 실패합니다.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ═══════════════════════════════════════════════════════════════
--  마지막 단계 — 나를 관리자로
-- ═══════════════════════════════════════════════════════════════
--  먼저 앱에서 한 번 로그인해서 계정을 만든 다음, 아래 줄의 주석을 풀고
--  이메일을 바꿔서 실행하세요. (트리거가 본인 수정은 막으므로
--  SQL Editor 에서 직접 실행해야 합니다 — 그게 의도한 동작입니다.)
--
-- update public.profiles set is_admin = true where email = '내이메일@example.com';


-- ═══════════════════════════════════════════════════════════════
--  ★ 제대로 걸렸는지 직접 확인하세요 ★
--
--  아래를 해봐야 배운 게 됩니다. 화면에 안 보이는 것만으로는 확인이 안 됩니다.
--
--  1. 계정 두 개를 만듭니다 (A, B)
--  2. A 로 로그인해서 프로젝트를 하나 만듭니다
--  3. B 로 로그인한 뒤 브라우저 콘솔에서:
--       await supabase.from('projects').select('*')
--     → data 가 빈 배열이면 성공입니다. A 의 프로젝트가 보이면 RLS 가 안 걸린 겁니다.
--  4. B 로 로그인한 채로:
--       await supabase.from('profiles').update({ is_admin: true }).eq('id', <B의 id>)
--     → 에러가 안 나도 괜찮습니다. 다시 조회해서 is_admin 이 여전히 false 면 성공입니다.
-- ═══════════════════════════════════════════════════════════════

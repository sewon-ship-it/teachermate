-- ═══════════════════════════════════════════════════════════════════
-- TeacherMate 초기 스키마 + 보안 정책
--
-- 보안 설계 요약 (자세한 설명은 docs/SECURITY.md)
--  1) 데이터 최소화: 학생 개인정보 컬럼이 아예 없다. 원문도 저장하지 않고 근거 문장만 저장한다.
--  2) 학교 단위 격리: 모든 업무 테이블에 school_id 가 있고, RLS 로 '내가 속한 학교'만 보인다.
--  3) 최소 권한: anon(비로그인)은 어떤 테이블도 못 본다. 학교 생성·합류는 검증된 RPC 로만.
--  4) 다층 방어: 브라우저·Edge Function 에 이어 DB 트리거가 개인정보 형식을 한 번 더 막는다.
--  5) AI 사용 기록은 글자 수·시각만 남기고 내용은 남기지 않는다.
-- ═══════════════════════════════════════════════════════════════════

-- ── 테이블 ──────────────────────────────────────────────────────────
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

create table public.memberships (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'teacher' check (role in ('admin', 'teacher')),
  created_at timestamptz not null default now(),
  primary key (school_id, user_id)
);
create index on public.memberships (user_id);

create table public.duties (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  kind text not null default 'duty' check (kind in ('homeroom', 'grade', 'duty')),
  created_at timestamptz not null default now()
);
create index on public.duties (school_id);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  duty_id uuid references public.duties(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  note text not null default '' check (char_length(note) <= 4000),
  due_date date,
  status text not null default 'draft' check (status in ('draft', 'confirmed')),
  origin text not null default 'manual' check (origin in ('sample', 'calendar', 'rule', 'ai', 'manual')),
  checklist jsonb not null default '[]' check (jsonb_typeof(checklist) = 'array' and pg_column_size(checklist) <= 20000),
  sources jsonb not null default '[]' check (jsonb_typeof(sources) = 'array' and pg_column_size(sources) <= 20000),
  location_path text not null default '' check (char_length(location_path) <= 500),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.tasks (school_id, due_date);

-- 완료 여부는 교사 개인별 (담임 공통 업무는 담임마다 따로 완료)
create table public.task_progress (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  done_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table public.handover_cards (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  duty_id uuid references public.duties(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  tips text not null default '' check (char_length(tips) <= 8000),
  location_path text not null default '' check (char_length(location_path) <= 500),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.handover_cards (school_id);

create table public.invites (
  code text primary key,
  school_id uuid not null references public.schools(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  max_uses int not null default 30,
  uses int not null default 0
);

-- AI 사용량: 내용 없이 숫자만. 학교별 크레딧·비용 한도 계산에 쓴다.
create table public.ai_usage (
  id bigint generated always as identity primary key,
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  input_chars int not null,
  output_tokens int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.ai_usage (school_id, created_at);

-- ── 도우미 함수 ─────────────────────────────────────────────────────
-- security definer + 빈 search_path: RLS 재귀를 피하고, 함수 하이재킹을 막는다.
create or replace function public.is_member(sid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships m where m.school_id = sid and m.user_id = auth.uid());
$$;

create or replace function public.is_admin(sid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.memberships m where m.school_id = sid and m.user_id = auth.uid() and m.role = 'admin');
$$;

-- 개인정보 형식 검사 (주민등록번호, 휴대전화)
create or replace function public.contains_pii(t text)
returns boolean language sql immutable set search_path = '' as $$
  select coalesce(t, '') ~ '(^|[^0-9])[0-9]{6}\s*-\s*[1-8][0-9]{6}([^0-9]|$)'
      or coalesce(t, '') ~ '(^|[^0-9])01[016789][-. ]?[0-9]{3,4}[-. ]?[0-9]{4}([^0-9]|$)';
$$;

create or replace function public.jsonb_texts(arr jsonb, key text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(string_agg(e ->> key, ' '), '') from jsonb_array_elements(coalesce(arr, '[]'::jsonb)) e;
$$;

-- ── 트리거: 개인정보 차단 + updated_at ───────────────────────────────
create or replace function public.guard_task()
returns trigger language plpgsql set search_path = '' as $$
begin
  if public.contains_pii(new.title) or public.contains_pii(new.note) or public.contains_pii(new.location_path)
     or public.contains_pii(public.jsonb_texts(new.checklist, 'text'))
     or public.contains_pii(public.jsonb_texts(new.sources, 'excerpt')) then
    raise exception 'PII_BLOCKED' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger tasks_guard before insert or update on public.tasks for each row execute function public.guard_task();

create or replace function public.guard_card()
returns trigger language plpgsql set search_path = '' as $$
begin
  if public.contains_pii(new.title) or public.contains_pii(new.tips) or public.contains_pii(new.location_path) then
    raise exception 'PII_BLOCKED' using errcode = 'check_violation';
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger cards_guard before insert or update on public.handover_cards for each row execute function public.guard_card();

-- 다른 학교의 업무분장을 끌어다 붙이는 것을 막는다
create or replace function public.guard_duty_same_school()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.duty_id is not null and not exists (
    select 1 from public.duties d where d.id = new.duty_id and d.school_id = new.school_id
  ) then
    raise exception 'DUTY_SCHOOL_MISMATCH';
  end if;
  return new;
end $$;
create trigger tasks_duty_school before insert or update on public.tasks for each row execute function public.guard_duty_same_school();
create trigger cards_duty_school before insert or update on public.handover_cards for each row execute function public.guard_duty_same_school();

-- 행의 school_id 를 다른 학교로 옮기는 것을 막는다
create or replace function public.lock_school_id()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.school_id <> old.school_id then raise exception 'SCHOOL_ID_IMMUTABLE'; end if;
  return new;
end $$;
create trigger duties_lock before update on public.duties for each row execute function public.lock_school_id();
create trigger tasks_lock before update on public.tasks for each row execute function public.lock_school_id();
create trigger cards_lock before update on public.handover_cards for each row execute function public.lock_school_id();

-- ── RLS ─────────────────────────────────────────────────────────────
alter table public.schools        enable row level security;
alter table public.memberships    enable row level security;
alter table public.duties         enable row level security;
alter table public.tasks          enable row level security;
alter table public.task_progress  enable row level security;
alter table public.handover_cards enable row level security;
alter table public.invites        enable row level security;
alter table public.ai_usage       enable row level security;

-- 비로그인 사용자는 아무것도 못 한다
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

create policy "학교: 구성원 조회" on public.schools for select to authenticated using (public.is_member(id));
create policy "학교: 관리자 수정" on public.schools for update to authenticated using (public.is_admin(id)) with check (public.is_admin(id));

create policy "구성원: 같은 학교 조회" on public.memberships for select to authenticated using (public.is_member(school_id));
create policy "구성원: 관리자 내보내기·본인 탈퇴" on public.memberships for delete to authenticated
  using (public.is_admin(school_id) or user_id = auth.uid());
-- insert/update 정책 없음 → create_school / join_school RPC 로만 생성, 역할 변경은 관리자 콘솔에서만

create policy "업무분장: 구성원" on public.duties for all to authenticated
  using (public.is_member(school_id)) with check (public.is_member(school_id));
create policy "할 일: 구성원" on public.tasks for all to authenticated
  using (public.is_member(school_id)) with check (public.is_member(school_id));
create policy "인수인계: 구성원 조회·작성·수정" on public.handover_cards for select to authenticated using (public.is_member(school_id));
create policy "인수인계: 구성원 작성" on public.handover_cards for insert to authenticated with check (public.is_member(school_id));
create policy "인수인계: 구성원 수정" on public.handover_cards for update to authenticated
  using (public.is_member(school_id)) with check (public.is_member(school_id));
create policy "인수인계: 작성자·관리자 삭제" on public.handover_cards for delete to authenticated
  using (public.is_admin(school_id) or (public.is_member(school_id) and created_by = auth.uid()));

create policy "완료: 본인 것만" on public.task_progress for all to authenticated
  using (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.school_id)))
  with check (user_id = auth.uid() and exists (select 1 from public.tasks t where t.id = task_id and public.is_member(t.school_id)));

create policy "초대: 관리자 조회" on public.invites for select to authenticated using (public.is_admin(school_id));
create policy "초대: 관리자 삭제" on public.invites for delete to authenticated using (public.is_admin(school_id));

create policy "AI 사용량: 구성원 조회" on public.ai_usage for select to authenticated using (public.is_member(school_id));
-- insert 정책 없음 → Edge Function(service role)만 기록

-- ── RPC ─────────────────────────────────────────────────────────────
create or replace function public.create_school(school_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare sid uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if (select count(*) from public.memberships where user_id = auth.uid() and role = 'admin') >= 3 then
    raise exception 'TOO_MANY_SCHOOLS';
  end if;
  insert into public.schools(name) values (btrim(school_name)) returning id into sid;
  insert into public.memberships(school_id, user_id, role) values (sid, auth.uid(), 'admin');
  return sid;
end $$;

create or replace function public.create_invite(sid uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare c text;
begin
  if not public.is_admin(sid) then raise exception 'FORBIDDEN'; end if;
  c := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  insert into public.invites(code, school_id, created_by, expires_at) values (c, sid, auth.uid(), now() + interval '7 days');
  return c;
end $$;

create or replace function public.join_school(invite_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare inv public.invites;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into inv from public.invites where code = upper(btrim(invite_code)) for update;
  if inv.code is null or inv.expires_at < now() or inv.uses >= inv.max_uses then
    raise exception 'INVALID_INVITE';
  end if;
  insert into public.memberships(school_id, user_id, role) values (inv.school_id, auth.uid(), 'teacher')
    on conflict do nothing;
  update public.invites set uses = uses + 1 where code = inv.code;
  return inv.school_id;
end $$;

-- 함수 실행 권한: 기본(public) 회수 후 로그인 사용자에게만
revoke execute on function public.create_school(text), public.create_invite(uuid), public.join_school(text),
  public.is_member(uuid), public.is_admin(uuid) from public, anon;
grant execute on function public.create_school(text), public.create_invite(uuid), public.join_school(text),
  public.is_member(uuid), public.is_admin(uuid) to authenticated;

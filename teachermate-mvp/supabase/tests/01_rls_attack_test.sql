-- RLS 공격 시나리오 테스트. 각 줄 위의 설명대로 0건/에러가 나와야 정상이다.
\set ON_ERROR_STOP 0
set role authenticated;
-- 교사 A: 학교 A 생성
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
select public.create_school('A초') as school_a \gset
insert into public.duties(school_id,name) values (:'school_a','정보 담당');
insert into public.tasks(school_id,title,due_date) values (:'school_a','동의서 수합','2026-03-20');
select public.create_invite(:'school_a') as code \gset
\echo '--- PII 차단 (에러가 나야 정상)'
insert into public.tasks(school_id,title) values (:'school_a','보호자 010-1234-5678 연락');
-- 교사 B: 학교 B
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false);
select public.create_school('B초') as school_b \gset
\echo '--- B는 A의 할 일을 볼 수 없다 (0이어야 정상)'
select count(*) from public.tasks where school_id = :'school_a';
\echo '--- B가 A 학교로 쓰기 시도 (RLS 에러가 나야 정상)'
insert into public.tasks(school_id,title) values (:'school_a','침입');
\echo '--- B가 A 할 일 수정 시도 (UPDATE 0이어야 정상)'
update public.tasks set title='변조' where school_id = :'school_a';
\echo '--- B가 스스로 A 학교 관리자로 가입 시도 (에러)'
insert into public.memberships values (:'school_a','22222222-2222-2222-2222-222222222222','admin');
\echo '--- 교사 C: 초대 코드로 A 합류 후 조회 (1이어야 정상)'
select set_config('request.jwt.claim.sub','33333333-3333-3333-3333-333333333333',false);
select public.join_school(:'code');
select count(*) from public.tasks;
\echo '--- C(교사)는 초대 코드를 만들 수 없다 (에러)'
select public.create_invite(:'school_a');
\echo '--- C가 자기 school_id를 B로 옮기기 시도 (에러)'
update public.tasks set school_id = :'school_b';
\echo '--- 비로그인 anon 조회 (권한 에러)'
reset role; set role anon;
select count(*) from public.tasks;

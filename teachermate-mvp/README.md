# TeacherMate (티처메이트)

학교 업무 인수인계·리마인드 AI 에이전트 — **우리 학교의 1년 업무 지도**

학년·업무가 바뀐 초등 교사가 1년에 한 번뿐인 업무의 절차와 선임자의 요령을 "물어보고 찾는" 대신, **제때 알림 받고 근거와 함께 바로 확인**하게 돕는다. (2026 「에듀테크 연계 융합교육 프로젝트」 03팀)

## MVP 기능

| 기능 | 하는 일 | AI |
|---|---|---|
| 1년 업무 지도 | 3월~2월 학년도 띠, 주차별 할 일, 내 업무분장 필터, 초안/확정 배지 | — |
| 학사력 불러오기 | 학사력 텍스트를 붙여 넣으면 날짜·행사를 읽어 초안으로 배치 | 사용 안 함 |
| 자료 → 업무 흐름 | 공문·회의자료 본문을 단계로 정리, 단계마다 원문 근거 문장 | 규칙 기본 / Claude 선택 |
| 리마인드 | 확정한 일만 D-7·D-1·기한 지남 표시, .ics로 휴대폰 캘린더 알림 | — |
| 인수인계 카드 | 업무분장별 요령·원본 위치(NAS 경로)·1년 일정 | — |

## 실행 (Windows)

Node.js 20 이상이 필요하다.

```powershell
cd C:\Project_Codes\20261211teachermate
npm install
npm run dev
```

브라우저에서 http://localhost:5173 을 연다. 환경 변수가 없으면 **로컬 체험 모드**(샘플 데이터, 브라우저 저장)로 열린다.

```powershell
npm test          # 단위 테스트
npm run build     # 타입 검사 + 배포용 빌드
```

## 학교 계정 모드 (Supabase)

1. https://supabase.com 에서 프로젝트 생성 (리전: Seoul).
2. SQL Editor에 `supabase/migrations/20261016000000_init.sql` 내용을 붙여 넣고 실행.
3. `.env.example`을 `.env.local`로 복사하고 Settings → API의 **Project URL**과 **anon public key**를 넣는다. **service_role 키는 넣지 않는다.**
4. `npm run dev` → 이메일 로그인 → 학교 만들기 → 데이터·보안 탭에서 초대 코드 발급.

### AI 정리 켜기 (선택)

```powershell
npx supabase login
npx supabase link --project-ref <프로젝트 ID>
npx supabase secrets set ANTHROPIC_API_KEY=<키> ALLOWED_ORIGIN=http://localhost:5173
npx supabase functions deploy ai-flow
```

그다음 `.env.local`에 `VITE_AI_ENABLED=true`. AI 키는 서버 시크릿에만 있고 브라우저에는 가지 않는다.

## 데이터 보안

요약: **학생 개인정보는 받지 않고, 원문은 저장하지 않고, 학교끼리는 DB가 격리한다.** 자세한 설계와 검증 결과는 [docs/SECURITY.md](docs/SECURITY.md).

### 보안 테스트 (선택, PostgreSQL 설치 필요)

```bash
createdb tm_test
psql -d tm_test -f supabase/tests/00_mock_supabase.sql
psql -d tm_test -f supabase/migrations/20261016000000_init.sql
psql -d tm_test -f supabase/tests/01_rls_attack_test.sql
```

## 폴더 구조

```
src/
  lib/          날짜·학사력·업무흐름 추출, 개인정보 차단기, .ics, 리마인드 (테스트 포함)
  data/         저장소 경계(로컬/Supabase), AI 호출
  components/   화면
supabase/
  migrations/   스키마 + RLS + 트리거 + RPC
  functions/    ai-flow Edge Function
  tests/        RLS 공격 시나리오
docs/           SECURITY.md, DEVLOG.md
```

## 알려진 한계

- 파일 업로드(PDF·HWP)는 아직 지원하지 않는다. 본문을 복사해 붙여 넣는다.
- 웹 알림은 앱을 열었을 때만 보인다. 닫아 두어도 알림을 받으려면 .ics를 캘린더에 가져온다.
- 규칙 기반 추출은 문장 구조가 특이하면 단계를 놓칠 수 있다. 모든 결과는 초안이며 교사가 확인 후 확정한다.
- 샘플 데이터의 업무 내용은 가상의 예시다. 실제 처리 절차는 학교·교육청 안내를 따른다.

## AI 사용 표기

코드 초안과 보안 설계 문서 작성에 Claude(Anthropic)를 사용했다. 개발 일지: [docs/DEVLOG.md](docs/DEVLOG.md)

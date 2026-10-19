// ═══════════════════════════════════════════════════════════════════
// Edge Function: ai-flow
// 업무 자료 본문 → 단계별 업무 흐름(JSON). AI 키는 여기(서버 환경변수)에만 있다.
//
// 보안 장치
//  - 로그인 토큰 필수 (Supabase 기본 JWT 검증 + getUser)
//  - 요청한 학교의 구성원인지 RLS 로 확인
//  - 본문 크기 제한, 개인정보 형식 재검사
//  - 학교별 하루 사용량 한도(크레딧), 사용자별 시간당 한도
//  - 본문·응답을 로그/DB에 남기지 않음 (글자 수·시각만 ai_usage 에 기록)
//  - AI가 낸 근거 문장이 원문에 실제로 있는지 서버에서 검증
//
// 필요한 시크릿 (supabase secrets set ...)
//  ANTHROPIC_API_KEY, ALLOWED_ORIGIN, (선택) ANTHROPIC_MODEL, AI_DAILY_LIMIT_PER_SCHOOL, AI_HOURLY_LIMIT_PER_USER
// ═══════════════════════════════════════════════════════════════════
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const MAX_CHARS = 20_000;
const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-5-5';
const DAILY_LIMIT = Number(Deno.env.get('AI_DAILY_LIMIT_PER_SCHOOL') ?? '50');
const HOURLY_LIMIT = Number(Deno.env.get('AI_HOURLY_LIMIT_PER_USER') ?? '10');
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') ?? '';

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  Vary: 'Origin',
});

const json = (status: number, body: unknown, origin: string | null) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors(origin), 'Content-Type': 'application/json; charset=utf-8' } });

function blockingPii(text: string): boolean {
  if (/(?<!\d)\d{6}\s*-\s*[1-8]\d{6}(?!\d)/.test(text)) return true;
  if (/(?<!\d)01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)/.test(text)) return true;
  if (text.split(/\r?\n/).some((l) => /[\t,|]/.test(l) && /(학번|성명|생년월일|보호자)/.test(l))) return true;
  const rows = text.split(/\r?\n/).filter((l) => /^\s*\d{1,3}\s*[.)\]\t,|]?\s*[가-힣]{2,4}(\s|$|[\t,|(])/.test(l));
  return rows.length >= 5;
}

const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

const SYSTEM = `너는 한국 초등학교 교사의 업무 자료를 '할 일 단계'로 정리하는 도우미다.
규칙:
- 반드시 JSON 하나만 출력한다. 형식: {"steps":[{"title":string,"due_date":string|null,"evidence":string}]}
- title: 교사가 해야 할 일을 40자 이내로. 원문에 없는 일을 만들지 않는다.
- due_date: 원문에 날짜가 명시된 경우에만 YYYY-MM-DD. 연도가 없으면 학년도 기준(3~12월은 학년도, 1~2월은 다음 해). 날짜가 없으면 null. 절대 추측하지 않는다.
- evidence: 그 단계의 근거가 된 원문 문장을 한 글자도 바꾸지 않고 그대로 복사한다.
- 최대 20단계, 원문 순서대로.`;

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(origin) });
  if (req.method !== 'POST') return json(405, { error: '허용되지 않은 요청이다.' }, origin);
  if (ALLOWED_ORIGIN && origin !== ALLOWED_ORIGIN) return json(403, { error: '허용되지 않은 출처다.' }, origin);

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json(503, { error: 'AI 기능이 아직 설정되지 않았다. 관리자에게 문의한다.' }, origin);

  const auth = req.headers.get('Authorization') ?? '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) return json(401, { error: '로그인이 필요하다.' }, origin);
  const userId = userData.user.id;

  let body: { schoolId?: string; text?: string; docTitle?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: '요청 형식이 잘못되었다.' }, origin);
  }
  const text = String(body.text ?? '');
  const schoolId = String(body.schoolId ?? '');
  if (!text.trim()) return json(400, { error: '본문이 비어 있다.' }, origin);
  if (text.length > MAX_CHARS) return json(413, { error: `본문은 ${MAX_CHARS.toLocaleString()}자까지 보낼 수 있다.` }, origin);
  if (blockingPii(text + '\n' + (body.docTitle ?? ''))) return json(422, { error: '개인정보로 보이는 내용이 있어 보내지 않았다.' }, origin);

  // 구성원 확인 (RLS: 내가 속한 학교의 membership 만 보인다)
  const { data: member } = await userClient.from('memberships').select('school_id').eq('school_id', schoolId).eq('user_id', userId).maybeSingle();
  if (!member) return json(403, { error: '이 학교의 구성원이 아니다.' }, origin);

  // 사용량 한도 (service role 은 이 함수 안에서만 쓴다)
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const dayAgo = new Date(Date.now() - 86_400_000).toISOString();
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const [{ count: daily }, { count: hourly }] = await Promise.all([
    admin.from('ai_usage').select('id', { count: 'exact', head: true }).eq('school_id', schoolId).gte('created_at', dayAgo),
    admin.from('ai_usage').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', hourAgo),
  ]);
  if ((daily ?? 0) >= DAILY_LIMIT) return json(429, { error: '오늘 학교 AI 사용 한도를 다 썼다. 규칙 정리는 계속 쓸 수 있다.' }, origin);
  if ((hourly ?? 0) >= HOURLY_LIMIT) return json(429, { error: '잠시 후 다시 시도한다. (시간당 사용 한도)' }, origin);

  let res: Response;
  try {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system: SYSTEM,
        messages: [{ role: 'user', content: `오늘 날짜: ${new Date().toISOString().slice(0, 10)}\n<document>\n${text}\n</document>` }],
      }),
    });
  } catch {
    return json(502, { error: 'AI 서버에 연결하지 못했다.' }, origin);
  }
  if (!res.ok) {
    // 상태 코드만 기록하고 본문은 남기지 않는다
    console.error('anthropic_error', res.status);
    return json(502, { error: 'AI 정리에 실패했다. 규칙 정리를 쓴다.' }, origin);
  }
  const out = await res.json();
  const raw = (out.content ?? []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
  let steps: Array<{ title: string; due_date: string | null; evidence: string }> = [];
  try {
    steps = JSON.parse(raw.replace(/```json|```/g, '').trim()).steps ?? [];
  } catch {
    return json(502, { error: 'AI 응답을 읽지 못했다. 다시 시도한다.' }, origin);
  }

  const source = norm(text);
  const checked = steps.slice(0, 20).map((s) => ({
    title: String(s.title ?? '').slice(0, 200),
    due_date: typeof s.due_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.due_date) ? s.due_date : null,
    evidence: String(s.evidence ?? '').slice(0, 1000),
    verified: source.includes(norm(String(s.evidence ?? ''))),
  }));

  await admin.from('ai_usage').insert({ school_id: schoolId, user_id: userId, input_chars: text.length, output_tokens: out.usage?.output_tokens ?? 0 });
  return json(200, { steps: checked }, origin);
});

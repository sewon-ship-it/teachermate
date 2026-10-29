import type { Task, HandoverCard, Duty } from './types';
import type { JungdaeEvent } from '../data/jungdaeData';

export interface ChatSource {
  type: 'event' | 'task' | 'card';
  id: string;
  label: string;
  excerpt: string;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
  uncertain: boolean;
}

/** 초등 교직 유의어 맵 */
const SYNONYMS: Record<string, string[]> = {
  '역사체험': ['현장체험학습', '체험학습', '역사'],
  '역사': ['현장체험학습', '체험학습'],
  '체험학습': ['현장체험학습', '역사체험', '소풍'],
  '소풍': ['현장체험학습', '체험학습'],
  '수학여행': ['현장체험학습', '수련활동'],
  '우애남매': ['우애', '남매', '동아리'],
  '과학의날': ['과학', '과학한마당', '발명'],
  '방학': ['방학식', '개학식'],
  '총회': ['학부모 총회', '수업공개', '설명회'],
};

function tokenize(text: string): string[] {
  const words = text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  // 유의어 확장
  const expanded = new Set(words);
  for (const w of words) {
    if (SYNONYMS[w]) {
      SYNONYMS[w].forEach((syn) => expanded.add(syn));
    }
  }
  return Array.from(expanded);
}

function score(queryTokens: string[], text: string): number {
  const lc = text.toLowerCase();
  let sc = 0;
  for (const q of queryTokens) {
    if (lc.includes(q.toLowerCase())) {
      sc += q.length >= 4 ? 3 : 1;
    }
  }
  return sc;
}

export function searchLocal(
  query: string,
  tasks: Task[],
  cards: HandoverCard[],
  duties: Duty[],
  events: JungdaeEvent[] = []
): ChatAnswer {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return { answer: '질문을 조금 더 구체적으로 적어 주세요.', sources: [], uncertain: true };
  }

  type Hit = { s: number; src: ChatSource };
  const hits: Hit[] = [];

  // 1. 학교 학사력 행사 검색 (1순위!)
  // 질문에 특정 학년(예: "5학년")이 있으면 학년 매칭 보너스 점수 부여
  const gradeMatch = query.match(/(\d)학년/);
  const targetGrade = gradeMatch ? gradeMatch[1] + '학년' : null;
  const isDateQuery = /언제|몇\s*월|며칠|날짜|일정|언제야/.test(query);

  for (const e of events) {
    let s = score(tokens, e.title);
    if (targetGrade && (e.title.includes(targetGrade) || (e.targetGrades && e.targetGrades.includes(parseInt(targetGrade))))) {
      s += 6; // 해당 학년 행사면 가중치 대폭 부여
    }
    if (isDateQuery) {
      s += 5; // 언제인지 묻는 날짜 질문이면 학사 행사에 추가 가중치
    }
    if (s > 0) {
      hits.push({
        s: s + 4, // 학사력 행사는 날짜 질문에 대해 우선순위 대폭 높임
        src: {
          type: 'event',
          id: e.date + '-' + e.title,
          label: `📅 2026 학사력 · ${e.title} (${e.date})`,
          excerpt: `중대부초 2026학년도 공식 학사 일정: ${e.date} ${e.title}`,
        },
      });
    }
  }

  // 2. 확정된 할 일 검색
  for (const t of tasks) {
    if (t.status !== 'confirmed') continue;
    const blob = [t.title, t.note, ...t.sources.map((s) => s.excerpt), t.locationPath].join(' ');
    let s = score(tokens, blob);
    if (targetGrade && (t.title.includes(targetGrade) || t.note.includes(targetGrade))) {
      s += 3;
    }
    if (s > 0) {
      const duty = duties.find((d) => d.id === t.dutyId);
      hits.push({
        s,
        src: {
          type: 'task',
          id: t.id,
          label: `${duty ? duty.name + ' · ' : ''}${t.title}${t.dueDate ? ` (${t.dueDate})` : ''}`,
          excerpt: t.note || t.sources[0]?.excerpt || t.title,
        },
      });
    }
  }

  // 3. 인수인계 카드 검색
  for (const c of cards) {
    const blob = [c.title, c.tips, c.locationPath].join(' ');
    const s = score(tokens, blob);
    if (s > 0) {
      const duty = duties.find((d) => d.id === c.dutyId);
      hits.push({
        s,
        src: {
          type: 'card',
          id: c.id,
          label: `${duty ? duty.name + ' · ' : ''}${c.title}`,
          excerpt: c.tips.slice(0, 120) || c.locationPath || c.title,
        },
      });
    }
  }

  const eventHits = hits.filter((h) => h.src.type === 'event').sort((a, b) => b.s - a.s);
  const otherHits = hits.filter((h) => h.src.type !== 'event').sort((a, b) => b.s - a.s);

  let topHits: Hit[] = [];
  if (eventHits.length > 0 && eventHits[0].s >= 3) {
    // 학사력 행사가 매칭되면 1순위로 반드시 배치!
    topHits.push(eventHits[0]);
    topHits.push(...otherHits.slice(0, 3));
  } else {
    hits.sort((a, b) => b.s - a.s);
    topHits = hits.slice(0, 4);
  }

  const top = topHits.map((h) => h.src);

  if (top.length === 0) {
    return {
      answer: '저장된 중대부초 학사력과 업무 자료에서 관련 내용을 찾지 못했습니다.',
      sources: [],
      uncertain: true,
    };
  }

  // 답변 문구 생성: 학사력 행사가 있으면 날짜를 똑똑하게 안내
  const eventHit = top.find((h) => h.type === 'event');
  let answerHeader = '';
  if (eventHit) {
    answerHeader = `2026학년도 중대부초 학사 일정 안내:\n👉 ${eventHit.label}\n\n`;
  }

  const answer = answerHeader + top.map((s) => `• ${s.label}\n  ${s.excerpt}`).join('\n\n');

  return { answer, sources: top, uncertain: false };
}

/** 실시간 Claude API 호출 (API 키가 등록되어 있을 때 사용) */
export async function askClaudeApi(
  query: string,
  apiKey: string,
  contextData: string
): Promise<string | null> {
  try {
    const prompt = `너는 중앙대학교사범대학부속초등학교(중대부초)의 교사 업무 전담 AI 비서다.
아래 제공된 '중대부초 실제 학사 일정 및 업무 데이터'만을 철저히 근거로 삼아 교사의 질문에 1~2문장으로 아주 명확하고 친절하게 답변하라. 날짜가 있으면 정확한 날짜(예: 10월 27일)를 짚어라.

질문: ${query}

중대부초 실제 데이터:
${contextData}`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.content?.[0]?.text ?? null;
  } catch {
    return null;
  }
}

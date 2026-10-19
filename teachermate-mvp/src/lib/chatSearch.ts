/**
 * 로컬 챗봇 검색 (AI 없이).
 * 저장된 tasks·cards 범위 안에서만 키워드 매칭으로 답변 근거를 찾는다.
 */
import type { Task, HandoverCard, Duty } from './types';

export interface ChatSource {
  type: 'task' | 'card';
  id: string;
  label: string;
  excerpt: string;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
  uncertain: boolean; // 근거 없으면 true → "확인 필요"
}

/** 간단한 형태소 분리: 2글자 이상 단어 추출 */
function tokenize(text: string): string[] {
  return text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
}

function score(query: string[], text: string): number {
  const lc = text.toLowerCase();
  return query.reduce((s, q) => s + (lc.includes(q.toLowerCase()) ? 1 : 0), 0);
}

export function searchLocal(
  query: string,
  tasks: Task[],
  cards: HandoverCard[],
  duties: Duty[]
): ChatAnswer {
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return { answer: '질문을 조금 더 구체적으로 적어 주세요.', sources: [], uncertain: true };
  }

  type Hit = { s: number; src: ChatSource };
  const hits: Hit[] = [];

  // 확정된 할 일 검색
  for (const t of tasks) {
    if (t.status !== 'confirmed') continue;
    const blob = [t.title, t.note, ...t.sources.map((s) => s.excerpt), t.locationPath].join(' ');
    const s = score(tokens, blob);
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

  // 인수인계 카드 검색
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

  hits.sort((a, b) => b.s - a.s);
  const top = hits.slice(0, 4).map((h) => h.src);

  if (top.length === 0) {
    return {
      answer: '저장된 할 일·인수인계 카드에서 관련 내용을 찾지 못했습니다.',
      sources: [],
      uncertain: true,
    };
  }

  const answer = top
    .map((s) => `• ${s.label}\n  ${s.excerpt}`)
    .join('\n\n');

  return { answer, sources: top, uncertain: false };
}

import type { Duty, HandoverCard, Task } from './types';
import { SCHOOL_MONTHS, formatKoreanDate, monthOf, todayISO } from './dates';
import { newId } from './id';

/**
 * 인수인계 문서 생성 (AI 없이, 저장된 확정 기록만 사용).
 * - 1년 기록 → 인수인계 카드 초안 (사업계획서 2-3 ⑤ 넘겨주기)
 * - 학년 말 인수인계서 일괄 생성 (Plus)
 * - 전입·신규 교사용 '우리 학교 업무 안내서' (Plus)
 * 이미 개인정보 검사를 거쳐 저장된 데이터만 엮으므로 새 정보를 만들어 내지 않는다.
 */

const byDate = (a: Task, b: Task) => (a.dueDate! < b.dueDate! ? -1 : 1);

/** 해당 업무분장의 확정·날짜 있는 일 (dutyId 가 null 이면 '지정 안 함') */
export function yearlyTasksOf(tasks: Task[], dutyId: string | null): Task[] {
  return tasks.filter((t) => t.status === 'confirmed' && t.dutyId === dutyId && t.dueDate).sort(byDate);
}

/** 할 일·카드에 적힌 원본 위치를 중복 없이 모은다 */
export function collectLocations(tasks: Task[], cards: HandoverCard[] = []): string[] {
  const set = new Set<string>();
  for (const x of [...cards, ...tasks]) {
    const p = x.locationPath.trim();
    if (p) set.add(p);
  }
  return Array.from(set);
}

/** 1년 동안 쌓인 확정 기록(메모·체크리스트·원본 위치)으로 인수인계 카드 초안을 만든다 */
export function draftCardFromYear(duty: Duty, tasks: Task[]): HandoverCard {
  const yearly = yearlyTasksOf(tasks, duty.id);
  const tips: string[] = [];
  for (const t of yearly) {
    const lines: string[] = [];
    if (t.note.trim()) lines.push(`  - ${t.note.trim()}`);
    for (const c of t.checklist) lines.push(`  - [${c.done ? '했음' : '남음'}] ${c.text}`);
    if (lines.length) tips.push(`${formatKoreanDate(t.dueDate!)} ${t.title}`, ...lines);
  }
  const locations = collectLocations(yearly);
  return {
    id: newId(),
    dutyId: duty.id,
    title: `${duty.name} 1년 흐름과 요령`,
    tips: tips.length
      ? `[1년 기록에서 모은 초안 — 검토 후 팁을 더한다]\n${tips.join('\n')}`
      : '[1년 기록에 메모·체크리스트가 없다 — 해 보니 알게 된 요령을 직접 적는다]',
    locationPath: locations.join(' / '),
    updatedAt: '',
  };
}

/** 카드 1장을 후임자에게 넘길 텍스트로 */
export function cardToText(c: HandoverCard, duty: Duty | undefined, tasks: Task[]): string {
  const yearly = yearlyTasksOf(tasks, c.dutyId).map((t) => `- ${formatKoreanDate(t.dueDate!)} ${t.title}`);
  return [
    `[인수인계] ${c.title}`,
    duty ? `업무분장: ${duty.name}` : '',
    '',
    '■ 요령',
    c.tips,
    '',
    '■ 원본 위치',
    c.locationPath || '(없음)',
    '',
    '■ 1년 일정',
    ...(yearly.length ? yearly : ['(확정된 일정 없음)']),
  ].join('\n');
}

const RULE = '─'.repeat(40);

/**
 * 학년 말 인수인계서 일괄 생성. 업무분장마다 카드·1년 일정·원본 위치 재확인 목록을 묶는다.
 * 카드가 없는 업무분장도 일정이 있으면 포함하고 '요령 비어 있음'을 표시한다.
 */
export function buildHandoverBundle(duties: Duty[], tasks: Task[], cards: HandoverCard[], schoolYear: number): string {
  const out = [`${schoolYear}학년도 학년 말 인수인계서`, `만든 날: ${formatKoreanDate(todayISO())}`, ''];
  let sections = 0;
  for (const d of duties) {
    const dCards = cards.filter((c) => c.dutyId === d.id);
    const yearly = yearlyTasksOf(tasks, d.id);
    if (!dCards.length && !yearly.length) continue;
    sections++;
    out.push(RULE, `■ ${d.name}`, RULE);
    if (dCards.length) {
      for (const c of dCards) out.push(`[${c.title}]`, c.tips || '(요령 비어 있음)', '');
    } else {
      out.push('(인수인계 카드 없음 — 요령을 적어 두면 후임자가 덜 헤맨다)', '');
    }
    out.push('1년 일정');
    for (const t of yearly) out.push(`- ${formatKoreanDate(t.dueDate!)} ${t.title}`);
    if (!yearly.length) out.push('(확정된 일정 없음)');
    const locs = collectLocations(tasks.filter((t) => t.dutyId === d.id), dCards);
    out.push('', '원본 위치 — 넘기기 전에 아직 그 자리에 있는지 확인한다');
    for (const p of locs) out.push(`[ ] ${p}`);
    if (!locs.length) out.push('(적힌 위치 없음)');
    out.push('');
  }
  if (!sections) out.push('확정된 일정이나 인수인계 카드가 아직 없다.');
  out.push(RULE, '이 문서는 TeacherMate에 저장된 기록을 모은 것이다. 교육청 지침과 학교 결재가 우선한다.');
  return out.join('\n');
}

/**
 * 전입·신규 교사용 '우리 학교 업무 안내서'.
 * 학교 전체의 확정 일정을 월별로, 업무분장별 요령과 원본 위치를 한 문서로 정리한다.
 */
export function buildSchoolGuide(
  schoolName: string,
  duties: Duty[],
  tasks: Task[],
  cards: HandoverCard[],
  schoolYear: number
): string {
  const dutyName = (id: string | null) => duties.find((d) => d.id === id)?.name ?? '공통';
  const confirmed = tasks.filter((t) => t.status === 'confirmed' && t.dueDate).sort(byDate);
  const out = [
    `${schoolName} 업무 안내서 (${schoolYear}학년도)`,
    '새로 오신 선생님께: 우리 학교에서 1년 동안 언제 무엇을 하는지, 누가(업무분장) 맡는지, 자료가 어디 있는지 모았다.',
    '',
    RULE,
    '1. 월별 업무 흐름',
    RULE,
  ];
  for (const m of SCHOOL_MONTHS) {
    const list = confirmed.filter((t) => monthOf(t.dueDate!) === m);
    if (!list.length) continue;
    out.push(`▶ ${m}월`);
    for (const t of list) out.push(`- ${formatKoreanDate(t.dueDate!)} [${dutyName(t.dutyId)}] ${t.title}`);
    out.push('');
  }
  if (!confirmed.length) out.push('(확정된 일정이 아직 없다)', '');

  out.push(RULE, '2. 업무분장별 요령', RULE);
  if (!cards.length) out.push('(인수인계 카드가 아직 없다)');
  for (const c of cards) out.push(`▶ ${dutyName(c.dutyId)} — ${c.title}`, c.tips || '(요령 비어 있음)', '');

  const locs = collectLocations(tasks, cards);
  out.push(RULE, '3. 자료 위치', RULE);
  for (const p of locs) out.push(`- ${p}`);
  if (!locs.length) out.push('(적힌 위치 없음)');
  out.push('', RULE, '이 안내서는 저장된 기록을 모은 것이다. 실제 절차는 학교 안내와 결재를 따른다.');
  return out.join('\n');
}

/** 할 일과 같은 업무분장의 인수인계 카드 (알림에서 선임자 팁을 바로 보여 주기 위함) */
export function relatedCards(task: Pick<Task, 'dutyId'>, cards: HandoverCard[]): HandoverCard[] {
  if (!task.dutyId) return [];
  return cards.filter((c) => c.dutyId === task.dutyId);
}

/** 학년도 기준 월 순서 (3월 ~ 다음 해 2월) */
export const SCHOOL_MONTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayISO(now: Date = new Date()): string {
  return toISO(now);
}

/** YYYY-MM-DD → 로컬 자정 Date */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: string, days: number): string {
  const d = parseISO(iso);
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** to - from (일). 양수면 미래 */
export function daysBetween(fromISO: string, toISOValue: string): number {
  const ms = parseISO(toISOValue).getTime() - parseISO(fromISO).getTime();
  return Math.round(ms / 86_400_000);
}

export function dDayLabel(diff: number): string {
  if (diff === 0) return 'D-day';
  return diff > 0 ? `D-${diff}` : `D+${-diff}`;
}

/** 날짜가 속한 학년도 (3월 시작) */
export function schoolYearOf(iso: string): number {
  const [y, m] = iso.split('-').map(Number);
  return m >= 3 ? y : y - 1;
}

export function yearForMonth(schoolYear: number, month: number): number {
  return month >= 3 ? schoolYear : schoolYear + 1;
}

/** 실제 존재하는 날짜인지 확인 후 ISO 반환. 아니면 null */
export function safeISO(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
  return toISO(d);
}

export function monthOf(iso: string): number {
  return Number(iso.split('-')[1]);
}

export function formatKoreanDate(iso: string): string {
  const d = parseISO(iso);
  const w = '일월화수목금토'[d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${w})`;
}

export interface FoundDate {
  iso: string;
  index: number;
  length: number;
  /** 바로 뒤에 '까지'가 붙어 마감일일 가능성이 높은가 */
  isDeadline: boolean;
}

/**
 * 문장 안의 날짜 표현을 찾는다.
 * 지원: 2026.3.2 / 2026-03-02 / 2026년 3월 2일 / 3월 2일 / 3.2 / 3/2
 * 연도가 없으면 학년도 기준으로 연도를 정한다 (3~12월 → 학년도, 1~2월 → 다음 해).
 */
export function findDates(text: string, schoolYear: number): FoundDate[] {
  const results: FoundDate[] = [];
  const taken: Array<[number, number]> = [];
  const overlaps = (s: number, e: number) => taken.some(([a, b]) => s < b && e > a);

  const push = (iso: string | null, index: number, length: number) => {
    if (!iso || overlaps(index, index + length)) return;
    taken.push([index, index + length]);
    const after = text.slice(index + length, index + length + 12);
    const isDeadline = /^\s*(\([^)]{1,4}\))?\s*(\d{1,2}\s*:\s*\d{2}\s*)?(까지|한)/.test(after);
    results.push({ iso, index, length, isDeadline });
  };

  const full = /(20\d{2})\s*[.\-/년]\s*(\d{1,2})\s*[.\-/월]\s*(\d{1,2})\s*일?\.?/g;
  for (const m of text.matchAll(full)) {
    push(safeISO(+m[1], +m[2], +m[3]), m.index!, m[0].length);
  }
  const korean = /(\d{1,2})\s*월\s*(\d{1,2})\s*일/g;
  for (const m of text.matchAll(korean)) {
    const mo = +m[1];
    push(safeISO(yearForMonth(schoolYear, mo), mo, +m[2]), m.index!, m[0].length);
  }
  const short = /(?<![\d.])(\d{1,2})\s*[./]\s*(\d{1,2})(?![\d])\.?/g;
  for (const m of text.matchAll(short)) {
    const mo = +m[1];
    push(safeISO(yearForMonth(schoolYear, mo), mo, +m[2]), m.index!, m[0].length);
  }
  return results.sort((a, b) => a.index - b.index);
}

/** 마감일 후보: '까지'가 붙은 날짜 우선, 없으면 마지막 날짜 */
export function pickDeadline(text: string, schoolYear: number): string | null {
  const found = findDates(text, schoolYear);
  if (found.length === 0) return null;
  const deadline = found.find((f) => f.isDeadline);
  return (deadline ?? found[found.length - 1]).iso;
}

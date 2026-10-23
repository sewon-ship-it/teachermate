import { findDates } from './dates';
import { newId } from './id';

export interface CalendarEvent {
  date: string;
  endDate: string | null;
  title: string;
  line: string;
}

export interface ParsedCalendarItem {
  id: string;
  date: string; // 'YYYY-MM-DD' 또는 ''
  endDate: string | null;
  title: string;
  dutyId: string | null;
  included: boolean;
  needsReview: boolean;
  sourceLine: string;
}

const WEEKDAY = /\(\s*[월화수목금토일]\s*\)/g;

/**
 * 학사력 텍스트를 한 줄씩 읽어 날짜와 행사명을 뽑는다.
 * 예) "3.2.(월) 입학식 및 시업식"  "2026.05.05 어린이날"  "7월 24일 여름방학식"  "10.14~10.16 현장체험학습"
 */
export function parseAcademicCalendar(text: string, schoolYear: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const found = findDates(line, schoolYear);
    if (found.length === 0) continue;

    const start = found[0];
    let endDate: string | null = null;
    let cutEnd = start.index + start.length;
    const second = found[1];
    if (second && /^\s*(\([^)]*\))?\s*[~∼\-–]\s*$/.test(line.slice(cutEnd, second.index))) {
      endDate = second.iso;
      cutEnd = second.index + second.length;
    } else {
      // "10.14~16" 처럼 끝 날짜에 월이 생략된 경우
      const tail = line.slice(cutEnd).match(/^\s*(\([^)]*\))?\s*[~∼]\s*(\d{1,2})(?![\d./월])\s*일?/);
      if (tail) {
        const [y, m] = start.iso.split('-');
        const d = Number(tail[2]);
        const candidate = `${y}-${m}-${String(d).padStart(2, '0')}`;
        if (d >= 1 && d <= 31 && candidate > start.iso) endDate = candidate;
        cutEnd += tail[0].length;
      }
    }

    const title = (line.slice(0, start.index) + ' ' + line.slice(cutEnd))
      .replace(WEEKDAY, ' ')
      .replace(/^[\s\-•·○◦▪*:|,.]+|[\s\-•·○◦▪*:|,]+$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    if (!title) continue;
    events.push({ date: start.iso, endDate, title: title.slice(0, 80), line });
  }
  return events;
}

/**
 * 텍스트 기반 파싱 결과를 미리보기 테이블용 ParsedCalendarItem으로 변환
 */
export function parseTextToItems(text: string, schoolYear: number, defaultDutyId: string | null = null): ParsedCalendarItem[] {
  const events = parseAcademicCalendar(text, schoolYear);
  return events.map((e) => ({
    id: newId(),
    date: e.date,
    endDate: e.endDate,
    title: e.title,
    dutyId: defaultDutyId,
    included: true,
    needsReview: !e.date,
    sourceLine: e.line,
  }));
}

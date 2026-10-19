import type { Duty, Task } from './types';
import { addDays } from './dates';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const compact = (iso: string) => iso.replace(/-/g, '');

/** 75바이트 줄 접기 (RFC 5545) — 한글은 3바이트라 글자 수 기준으로 보수적으로 접는다 */
function fold(line: string): string {
  const chunks: string[] = [];
  let rest = line;
  while (rest.length > 24) {
    chunks.push(rest.slice(0, 24));
    rest = rest.slice(24);
  }
  chunks.push(rest);
  return chunks.join('\r\n ');
}

/**
 * 확정된 할 일만 캘린더 파일(.ics)로 내보낸다.
 * 휴대폰·구글/네이버 캘린더에 가져오면 D-7, D-1 오전 9시에 알림이 울린다.
 * (웹앱을 닫아 두어도 알림이 오도록 하는 가장 단순한 방법)
 */
export function buildIcs(tasks: Task[], duties: Duty[], now = new Date()): string {
  const dutyName = new Map(duties.map((d) => [d.id, d.name]));
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//TeacherMate//KO', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:TeacherMate 학교 업무'];
  for (const t of tasks) {
    if (t.status !== 'confirmed' || !t.dueDate) continue;
    const duty = t.dutyId ? dutyName.get(t.dutyId) : undefined;
    const desc = [duty ? `업무분장: ${duty}` : '', t.note, ...t.checklist.map((c) => `☐ ${c.text}`), t.locationPath ? `원본 위치: ${t.locationPath}` : '']
      .filter(Boolean)
      .join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${t.id}@teachermate`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(t.dueDate)}`,
      `DTEND;VALUE=DATE:${compact(addDays(t.dueDate, 1))}`,
      fold(`SUMMARY:${esc(t.title)}`),
      fold(`DESCRIPTION:${esc(desc)}`),
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:D-7 업무 알림', 'TRIGGER:-P6DT15H', 'END:VALARM',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:D-1 업무 알림', 'TRIGGER:-PT15H', 'END:VALARM',
      'END:VEVENT'
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

import * as XLSX from 'xlsx';
import type { ParsedCalendarItem } from './calendarParser';
import { findDates } from './dates';
import { newId } from './id';

export async function extractCalendarFromExcel(
  file: File,
  schoolYear: number,
  defaultDutyId: string | null = null
): Promise<ParsedCalendarItem[]> {
  const buffer = await file.arrayBuffer();
  return extractCalendarFromExcelBuffer(buffer, schoolYear, defaultDutyId);
}

export function extractCalendarFromExcelBuffer(
  buffer: ArrayBuffer,
  schoolYear: number,
  defaultDutyId: string | null = null
): ParsedCalendarItem[] {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const items: ParsedCalendarItem[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    // 시트를 2차원 배열로 변환
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!data || data.length === 0) continue;

    // 헤더 행 탐색 (일자, 날짜, 행사명, 내용 등)
    let dateColIdx = -1;
    let eventColIdx = -1;

    for (let r = 0; r < Math.min(data.length, 5); r++) {
      const row = data[r];
      if (!Array.isArray(row)) continue;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c]).trim();
        if (dateColIdx === -1 && /^(일자|날짜|일시|월일|기간)$/.test(val)) {
          dateColIdx = c;
        }
        if (eventColIdx === -1 && /^(행사|행사명|학사일정|일정|내용|행사내용)$/.test(val)) {
          eventColIdx = c;
        }
      }
    }

    // 1. 헤더가 감지된 경우 열 기반 파싱
    if (dateColIdx !== -1 && eventColIdx !== -1) {
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!Array.isArray(row)) continue;
        const dateRaw = row[dateColIdx];
        const eventRaw = row[eventColIdx];
        if (!dateRaw || !eventRaw) continue;

        const eventTitle = String(eventRaw).trim();
        if (!eventTitle || /^(행사|행사명|학사일정|일정|내용)$/.test(eventTitle)) continue;

        const iso = parseCellToIso(dateRaw, schoolYear);
        if (iso) {
          items.push({
            id: newId(),
            date: iso,
            endDate: null,
            title: eventTitle,
            dutyId: defaultDutyId,
            included: true,
            needsReview: false,
            sourceLine: `${iso} ${eventTitle}`,
          });
        }
      }
    } else {
      // 2. 일반 2차원 셀 순회 (날짜 셀 찾고 오른쪽 셀에서 행사명 추출)
      for (let r = 0; r < data.length; r++) {
        const row = data[r];
        if (!Array.isArray(row)) continue;

        for (let c = 0; c < row.length; c++) {
          const cellVal = row[c];
          const iso = parseCellToIso(cellVal, schoolYear);
          if (!iso) continue;

          // 오른쪽 인접 셀들 확인
          let eventTitle = '';
          for (let nextC = c + 1; nextC < Math.min(row.length, c + 4); nextC++) {
            const nextVal = String(row[nextC] ?? '').trim();
            // 요일이나 날짜, 빈칸 제외
            if (nextVal && !/^[월화수목금토일]$/.test(nextVal) && !parseCellToIso(nextVal, schoolYear)) {
              eventTitle = nextVal;
              break;
            }
          }

          if (eventTitle && eventTitle.length > 1) {
            items.push({
              id: newId(),
              date: iso,
              endDate: null,
              title: eventTitle,
              dutyId: defaultDutyId,
              included: true,
              needsReview: false,
              sourceLine: `${iso} ${eventTitle}`,
            });
          }
        }
      }
    }
  }

  // 중복 제거 및 날짜 정렬
  const seen = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const key = `${item.date}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueItems.sort((a, b) => a.date.localeCompare(b.date));
}

function parseCellToIso(val: any, schoolYear: number): string | null {
  if (!val) return null;

  // Date 객체인 경우
  if (val instanceof Date && !isNaN(val.getTime())) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, '0');
    const d = String(val.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const s = String(val).trim();
  // findDates 활용
  const found = findDates(s, schoolYear);
  if (found.length > 0) {
    return found[0].iso;
  }

  return null;
}

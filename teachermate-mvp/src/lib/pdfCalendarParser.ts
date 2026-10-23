import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ParsedCalendarItem } from './calendarParser';
import { parseAcademicCalendar } from './calendarParser';
import { newId } from './id';

// Vite 브라우저 환경에서만 worker 경로 설정
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}

const SOLAR_TERMS = new Set([
  '입춘', '우수', '경칩', '춘분', '청명', '곡우',
  '입하', '소만', '망종', '하지', '소서', '대서',
  '입추', '처서', '백로', '추분', '한로', '상강',
  '입동', '소설', '대설', '동지', '소한', '대한',
]);

function isIgnoredText(str: string): boolean {
  const s = str.trim();
  if (!s) return true;
  // 음력 날짜 (예: 1.15, 2.1)
  if (/^\d{1,2}\.\d{1,2}$/.test(s)) return true;
  // 24절기
  if (SOLAR_TERMS.has(s)) return true;
  // 요일 머리글
  if (/^(일\s*SUN|월\s*MON|화\s*TUE|수\s*WED|목\s*THU|금\s*FRI|토\s*SAT)$/i.test(s)) return true;
  if (/^(SUN|MON|TUE|WED|THU|FRI|SAT|Su|Mo|Tu|We|Th|Fr|Sa)$/i.test(s)) return true;
  if (/^(일|월|화|수|목|금|토)$/.test(s)) return true;
  // 바닥글 및 안내 문구
  if (/http|Tel|Fax|www\.|학사일정은|교훈|교목|교화|시정표/i.test(s)) return true;
  // 단독 특수문자
  if (/^[※*•·○◦▪\-|/,.:;]+$/.test(s)) return true;
  return false;
}

interface RawPdfItem {
  str: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export async function extractCalendarFromPdf(
  file: File,
  schoolYear: number,
  defaultDutyId: string | null = null
): Promise<ParsedCalendarItem[]> {
  const buffer = await file.arrayBuffer();
  return extractCalendarFromPdfBuffer(buffer, schoolYear, defaultDutyId);
}

export async function extractCalendarFromPdfBuffer(
  buffer: ArrayBuffer,
  schoolYear: number,
  defaultDutyId: string | null = null
): Promise<ParsedCalendarItem[]> {
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const allItems: ParsedCalendarItem[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const rawItems: RawPdfItem[] = content.items
      .map((it: any) => ({
        str: (it.str ?? '').trim(),
        x: Math.round(it.transform[4]),
        y: Math.round(it.transform[5]),
        w: Math.round(it.width ?? 0),
        h: Math.round(it.height ?? 0),
      }))
      .filter((it) => it.str.length > 0 && !isIgnoredText(it.str));

    // 1. 해당 페이지의 년/월 식별
    let pageMonth = 0;
    let pageYear = schoolYear;

    for (const it of content.items as any[]) {
      const s = (it.str ?? '').trim();
      const mMatch = s.match(/^(0[1-9]|1[0-2])$/);
      // 상단 좌측의 큰 월 표시 (예: "03", "04")
      if (mMatch && it.transform[5] > 350 && it.transform[4] < 150) {
        pageMonth = parseInt(mMatch[1], 10);
      }
      const ym = s.match(/(202[5-9]|203[0-5])/);
      if (ym) pageYear = parseInt(ym[1], 10);
    }

    if (pageMonth === 0) {
      // 보조 탐색: "3월", "March" 등
      for (const it of content.items as any[]) {
        const s = (it.str ?? '').trim();
        const m = s.match(/^(\d{1,2})월$/);
        if (m) {
          pageMonth = parseInt(m[1], 10);
          break;
        }
      }
    }

    // 3월~12월은 학년도 연도, 1월~2월은 다음 해 연도 적용
    if (pageMonth >= 1 && pageMonth <= 2 && pageYear === schoolYear) {
      pageYear = schoolYear + 1;
    }

    // 2. 날짜 숫자(1~31) 찾기
    const dayNumbers = rawItems.filter((it) => /^[1-9]$|^[12][0-9]$|^3[01]$/.test(it.str));

    // 날짜 숫자가 15개 이상 있고 월이 식별되면 달력 그리드로 처리
    if (pageMonth > 0 && dayNumbers.length >= 15) {
      // 주(row) 그룹화
      const sortedDays = [...dayNumbers].sort((a, b) => b.y - a.y);
      const rows: { y: number; days: RawPdfItem[] }[] = [];
      for (const d of sortedDays) {
        let r = rows.find((row) => Math.abs(row.y - d.y) <= 15);
        if (!r) {
          r = { y: d.y, days: [] };
          rows.push(r);
        }
        r.days.push(d);
      }
      rows.sort((a, b) => b.y - a.y);

      // 열(column) 그룹화 (X좌표 기준)
      const cols: { x: number; count: number }[] = [];
      for (const d of dayNumbers) {
        let c = cols.find((col) => Math.abs(col.x - d.x) <= 25);
        if (!c) {
          c = { x: d.x, count: 0 };
          cols.push(c);
        }
        c.count++;
      }
      cols.sort((a, b) => a.x - b.x);

      // 각 셀의 행사 추출
      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        const yBaseline = row.y;
        const yTop = yBaseline + 15;
        const yBottom = rIdx + 1 < rows.length ? rows[rIdx + 1].y + 15 : yBaseline - 65;

        for (let cIdx = 0; cIdx < cols.length; cIdx++) {
          const col = cols[cIdx];
          const xLeft = cIdx === 0 ? col.x - 20 : (cols[cIdx - 1].x + col.x) / 2;
          const xRight = cIdx + 1 < cols.length ? (col.x + cols[cIdx + 1].x) / 2 : col.x + 85;

          const cellItems = rawItems
            .filter((it) => it.x >= xLeft && it.x < xRight && it.y >= yBottom && it.y <= yTop)
            .sort((a, b) => b.y - a.y || a.x - b.x);

          const dayItem = cellItems.find((it) => /^[1-9]$|^[12][0-9]$|^3[01]$/.test(it.str));
          if (!dayItem) continue;

          const dayNum = parseInt(dayItem.str, 10);
          const iso = `${pageYear}-${String(pageMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

          const textItems = cellItems.filter(
            (it) => it !== dayItem && !/^[1-9]$|^[12][0-9]$|^3[01]$/.test(it.str)
          );
          if (textItems.length === 0) continue;

          // 같은 줄 또는 인접 줄 결합
          const lines: string[] = [];
          let cur: string[] = [];
          let lastY = -999;
          for (const t of textItems) {
            if (lastY === -999 || Math.abs(t.y - lastY) <= 5) {
              cur.push(t.str);
            } else {
              lines.push(cur.join(' '));
              cur = [t.str];
            }
            lastY = t.y;
          }
          if (cur.length) lines.push(cur.join(' '));

          // 괄호 열림/닫힘 및 줄바꿈 보정 병합
          const mergedTitles: string[] = [];
          for (let i = 0; i < lines.length; i++) {
            let l = lines[i].trim();
            // 앞 라인이 괄호로 시작하거나 열린 괄호가 남아있는 경우 합침
            if (
              mergedTitles.length > 0 &&
              ((mergedTitles[mergedTitles.length - 1].includes('(') &&
                !mergedTitles[mergedTitles.length - 1].includes(')')) ||
                l.startsWith('(') ||
                l.startsWith('~') ||
                l.length <= 4)
            ) {
              mergedTitles[mergedTitles.length - 1] += ' ' + l;
            } else {
              mergedTitles.push(l);
            }
          }

          for (let title of mergedTitles) {
            title = title
              .replace(/^[•·○◦▪\-*:|,.]+|[•·○◦▪\-*:|,.]+$/g, '')
              .replace(/\s{2,}/g, ' ')
              .trim();
            if (title && title.length > 1) {
              allItems.push({
                id: newId(),
                date: iso,
                endDate: null,
                title,
                dutyId: defaultDutyId,
                included: true,
                needsReview: false,
                sourceLine: `${iso} ${title}`,
              });
            }
          }
        }
      }
    } else {
      // 3. 달력 그리드가 아닌 경우 목록형 텍스트 추출 시도
      const pageText = (content.items as any[])
        .map((it) => it.str ?? '')
        .join(' ')
        .replace(/ {2,}/g, ' ');
      const parsed = parseAcademicCalendar(pageText, schoolYear);
      for (const ev of parsed) {
        allItems.push({
          id: newId(),
          date: ev.date,
          endDate: ev.endDate,
          title: ev.title,
          dutyId: defaultDutyId,
          included: true,
          needsReview: !ev.date,
          sourceLine: ev.line,
        });
      }
    }
  }

  // 중복 제거 및 날짜순 정렬
  const seen = new Set<string>();
  const uniqueItems = allItems.filter((item) => {
    const key = `${item.date}|${item.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueItems.sort((a, b) => a.date.localeCompare(b.date));
}

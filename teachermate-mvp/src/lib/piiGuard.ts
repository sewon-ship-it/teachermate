/**
 * 개인정보 차단 검사기 (클라이언트 1차 방어).
 * 서버(Edge Function)와 DB 트리거에서도 같은 종류의 검사를 한 번 더 한다.
 *
 * 원칙: 학생 명단·연락처·주민등록번호가 들어간 자료는 아예 받지 않는다.
 * 데이터가 없으면 유출될 것도 없다.
 */
export type PiiSeverity = 'block' | 'warn';

export interface PiiFinding {
  type: 'rrn' | 'mobile' | 'email' | 'roster-header' | 'name-list' | 'foreigner-no';
  label: string;
  severity: PiiSeverity;
  count: number;
  /** 화면 표시용 가림 처리된 예시 */
  example: string;
}

export interface PiiResult {
  blocked: boolean;
  findings: PiiFinding[];
}

// 흔한 성씨 (명단 판별용)
const SURNAMES = new Set(
  '김이박최정강조윤장임한오서신권황안송류전홍고문양손배백허유남심노하곽성차주우구민진나지엄채원천방공현함변염여추도소석선설마길연위표명기반왕금옥육인맹제모탁국어은편용예봉경사부가복태목형피두감음빈동온호범좌팽승간상시갈단견당화창'.split('')
);

const mask = (s: string) => (s.length <= 2 ? s[0] + '*' : s.slice(0, 2) + '*'.repeat(Math.min(s.length - 2, 8)));

function collect(re: RegExp, text: string): string[] {
  return Array.from(text.matchAll(re), (m) => m[0]);
}

export function scanPii(text: string): PiiResult {
  const findings: PiiFinding[] = [];
  if (!text || !text.trim()) return { blocked: false, findings };

  const rrn = collect(/(?<!\d)\d{6}\s*-\s*[1-8]\d{6}(?!\d)/g, text);
  if (rrn.length) {
    findings.push({ type: 'rrn', label: '주민등록번호·외국인등록번호 형식', severity: 'block', count: rrn.length, example: mask(rrn[0]) });
  }

  const mobile = collect(/(?<!\d)01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}(?!\d)/g, text);
  if (mobile.length) {
    findings.push({ type: 'mobile', label: '휴대전화 번호', severity: 'block', count: mobile.length, example: mask(mobile[0]) });
  }

  const email = collect(/[\w.+-]+@[\w-]+\.[\w.-]+/g, text);
  if (email.length) {
    findings.push({ type: 'email', label: '이메일 주소 (학교 공용 주소라면 괜찮다)', severity: 'warn', count: email.length, example: mask(email[0]) });
  }

  // 표 머리글에 명단 항목이 있는 경우 (탭·쉼표·| 로 나뉜 줄)
  const lines = text.split(/\r?\n/);
  const headerRe = /(학번|성명|이름|생년월일|보호자|학부모\s*연락처|주소)/;
  const rosterHeaders = lines.filter((l) => /[\t,|]/.test(l) && headerRe.test(l) && l.split(/[\t,|]/).length >= 2);
  if (rosterHeaders.length) {
    findings.push({ type: 'roster-header', label: '명단 표 머리글(학번·성명·연락처 등)', severity: 'block', count: rosterHeaders.length, example: rosterHeaders[0].slice(0, 20) });
  }

  // 번호 + 이름 형태의 줄이 5줄 이상이면 명단으로 본다. 예) "1 김민준", "02. 이서연", "3\t박지호"
  const nameRow = /^\s*\d{1,3}\s*[.)\]\t,|]?\s*([가-힣]{2,4})(?=$|[\s\t,|(])/;
  const names = new Set<string>();
  for (const l of lines) {
    const m = l.match(nameRow);
    if (m && SURNAMES.has(m[1][0])) names.add(m[1]);
  }
  if (names.size >= 5) {
    const first = Array.from(names)[0];
    findings.push({ type: 'name-list', label: '번호가 붙은 이름 목록(학생·교원 명단으로 보임)', severity: 'block', count: names.size, example: mask(first) });
  }

  return { blocked: findings.some((f) => f.severity === 'block'), findings };
}

/** 한 줄짜리 입력(제목, 메모, 경로)에 대한 간단 검사 */
export function hasBlockingPii(...texts: string[]): boolean {
  return texts.some((t) => scanPii(t).blocked);
}

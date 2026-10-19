import { newId } from './id';
import { pickDeadline } from './dates';

export interface FlowStep {
  id: string;
  title: string;
  dueDate: string | null;
  evidence: string;
  verified: boolean;
}

const ACTION =
  /(제출|작성|입력|등록|회신|보고|신청|발송|수합|취합|안내|공지|준비|점검|결재|품의|업로드|확인|처리|게시|배부|협조|실시|운영|승인|검토)/;

const BULLET = /^\s*([-–•·○◦▪*□■]|\d{1,2}[.)]|[가-하][.)]|\(\d{1,2}\)|[①-⑳])\s*/;

export function splitSentences(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(BULLET, '').trim();
    if (!line) continue;
    // "~다." "~함." "~요." 뒤에서 문장 나누기
    for (const s of line.split(/(?<=[다함요음됨임][.!?])\s+/)) {
      const t = s.trim();
      if (t.length >= 4) out.push(t);
    }
  }
  return out;
}

export function normalizeSpace(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

/** 근거 문장이 원문 안에 그대로 있는지(공백 차이는 무시) */
export function isVerbatim(evidence: string, source: string): boolean {
  const e = normalizeSpace(evidence);
  return e.length > 0 && normalizeSpace(source).includes(e);
}

/**
 * 규칙 기반 업무흐름 추출 (AI를 쓰지 않는 기본 모드).
 * 행동 동사가 있는 문장을 단계로 삼고, 마감일이 없으면 null('원문에서 확인되지 않음')로 둔다.
 * 절대 날짜를 추측해서 채우지 않는다.
 */
export function extractFlowRuleBased(text: string, schoolYear: number, max = 30): FlowStep[] {
  const steps: FlowStep[] = [];
  for (const s of splitSentences(text)) {
    if (!ACTION.test(s)) continue;
    const due = pickDeadline(s, schoolYear);
    // 문장으로 끝나지 않고 날짜도 없는 줄(예: "OO 계획 안내")은 제목으로 보고 건너뛴다
    if (!due && !/[다함요음됨임][.!?]?$/.test(s)) continue;
    const title = s.length > 80 ? s.slice(0, 78) + '…' : s;
    steps.push({ id: newId(), title, dueDate: due, evidence: s, verified: isVerbatim(s, text) });
    if (steps.length >= max) break;
  }
  return steps;
}

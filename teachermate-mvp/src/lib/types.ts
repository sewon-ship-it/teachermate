/** 업무분장 종류: 담임 공통 / 학년 업무 / 부서·개별 업무 */
export type DutyKind = 'homeroom' | 'grade' | 'duty';

export interface Duty {
  id: string;
  name: string; // 실명 대신 업무분장명 (예: "6학년 담임", "정보 담당")
  kind: DutyKind;
}

/** draft = 초안(교사 확인 전), confirmed = 교사가 확정 */
export type TaskStatus = 'draft' | 'confirmed';

/** 할 일이 어디서 왔는지 */
export type TaskOrigin = 'sample' | 'calendar' | 'rule' | 'ai' | 'manual';

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

/** 원문 근거. 원문 전체는 저장하지 않고, 근거가 된 문장만 남긴다. */
export interface SourceRef {
  docTitle: string;
  excerpt: string;
  /** 근거 문장이 실제 원문 안에 그대로 있는지 확인되었는가 */
  verified: boolean;
}

export interface Task {
  id: string;
  dutyId: string | null;
  title: string;
  note: string;
  dueDate: string | null; // YYYY-MM-DD, 없으면 '확인 필요'
  status: TaskStatus;
  origin: TaskOrigin;
  checklist: ChecklistItem[];
  sources: SourceRef[];
  /** 개인정보가 담긴 원본은 업로드하지 않고 학교 내부 위치만 적는다 (예: NAS 경로) */
  locationPath: string;
  done: boolean; // 현재 사용자 기준 완료 여부
  updatedAt: string;
}

export interface MonthlyFlowItem {
  month: number;
  label: string;
  summary: string;
  drafts: string[];
}

export interface PastDraftItem {
  year: number;
  draftNo: string;
  date: string;
  title: string;
  author?: string;
  note?: string;
}

export interface HandoverCard {
  id: string;
  dutyId: string | null;
  title: string;
  tips: string;
  locationPath: string;
  updatedAt: string;
  // 가동초 스타일 확장 필드
  firstTimeGuide?: string; // 처음 맡았다면 · 이렇게 해요
  monthlyFlow?: MonthlyFlowItem[]; // 작년·올해 비교로 본 월별 기안 흐름
  pastDrafts?: PastDraftItem[]; // 2025~2026학년도 실제 기안문 No 목록
  personInCharge?: string; // 담당 교사/부장님 (예: 이기남 부장님)
}

export interface AppData {
  duties: Duty[];
  tasks: Task[];
  cards: HandoverCard[];
}

import type { AppData, Duty, HandoverCard, Task } from '../lib/types';

export type RepoMode = 'local' | 'supabase';

/**
 * 저장소 경계. 화면은 이 인터페이스만 알고, 어디에 저장되는지는 모른다.
 * - LocalRepo: 브라우저 localStorage (체험·시연용, 샘플 데이터만 권장)
 * - SupabaseRepo: Postgres + RLS (학교 단위 격리)
 */
export interface Repo {
  mode: RepoMode;
  load(): Promise<AppData>;
  saveTask(task: Task): Promise<Task>;
  saveTasks(tasks: Task[]): Promise<Task[]>;
  deleteTask(id: string): Promise<void>;
  setTaskDone(id: string, done: boolean): Promise<void>;
  saveDuty(duty: Duty): Promise<Duty>;
  deleteDuty(id: string): Promise<void>;
  saveCard(card: HandoverCard): Promise<HandoverCard>;
  deleteCard(id: string): Promise<void>;
  /** 이 기기/계정에서 볼 수 있는 데이터를 JSON 으로 내보내기 */
  exportJson(): Promise<string>;
}

export class PiiBlockedError extends Error {
  constructor() {
    super('개인정보로 보이는 내용(휴대전화 번호, 주민등록번호, 명단 등)이 있어 저장하지 않았다. 해당 부분을 지우고 다시 저장한다.');
  }
}

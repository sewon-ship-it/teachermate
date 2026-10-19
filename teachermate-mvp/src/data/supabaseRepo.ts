import type { SupabaseClient } from '@supabase/supabase-js';
import type { AppData, Duty, HandoverCard, Task } from '../lib/types';
import { hasBlockingPii } from '../lib/piiGuard';
import { PiiBlockedError, type Repo } from './repo';

type Row = Record<string, any>;

const toTask = (r: Row, doneIds: Set<string>): Task => ({
  id: r.id, dutyId: r.duty_id, title: r.title, note: r.note ?? '', dueDate: r.due_date,
  status: r.status, origin: r.origin, checklist: r.checklist ?? [], sources: r.sources ?? [],
  locationPath: r.location_path ?? '', done: doneIds.has(r.id), updatedAt: r.updated_at,
});

const fromTask = (t: Task, schoolId: string): Row => ({
  id: t.id, school_id: schoolId, duty_id: t.dutyId, title: t.title, note: t.note, due_date: t.dueDate,
  status: t.status, origin: t.origin, checklist: t.checklist, sources: t.sources, location_path: t.locationPath,
});

const toCard = (r: Row): HandoverCard => ({
  id: r.id, dutyId: r.duty_id, title: r.title, tips: r.tips ?? '', locationPath: r.location_path ?? '', updatedAt: r.updated_at,
});

function check<T>(res: { data: T | null; error: any }): T {
  if (res.error) {
    if (String(res.error.message).includes('PII_BLOCKED')) throw new PiiBlockedError();
    throw new Error(res.error.message);
  }
  return res.data as T;
}

/**
 * 서버 모드 저장소. 모든 쿼리는 로그인한 교사의 JWT 로 실행되고,
 * 어떤 학교의 데이터를 볼 수 있는지는 DB 의 RLS 정책이 결정한다.
 * (여기서 school_id 를 조작해도 다른 학교 데이터는 읽거나 쓸 수 없다.)
 */
export class SupabaseRepo implements Repo {
  mode = 'supabase' as const;
  constructor(private sb: SupabaseClient, private schoolId: string, private userId: string) {}

  async load(): Promise<AppData> {
    const [duties, tasks, cards, progress] = await Promise.all([
      this.sb.from('duties').select('*').eq('school_id', this.schoolId).order('created_at'),
      this.sb.from('tasks').select('*').eq('school_id', this.schoolId),
      this.sb.from('handover_cards').select('*').eq('school_id', this.schoolId),
      this.sb.from('task_progress').select('task_id').eq('user_id', this.userId),
    ]);
    const doneIds = new Set<string>(check(progress).map((p: Row) => p.task_id));
    return {
      duties: check(duties).map((d: Row) => ({ id: d.id, name: d.name, kind: d.kind })),
      tasks: check(tasks).map((r: Row) => toTask(r, doneIds)),
      cards: check(cards).map(toCard),
    };
  }

  private guard(t: Task) {
    if (hasBlockingPii(t.title, t.note, t.locationPath, ...t.checklist.map((c) => c.text), ...t.sources.map((s) => s.excerpt))) {
      throw new PiiBlockedError();
    }
  }

  async saveTask(task: Task) {
    this.guard(task);
    const row = check<Row>(await this.sb.from('tasks').upsert(fromTask(task, this.schoolId)).select().single());
    return toTask(row, new Set(task.done ? [task.id] : []));
  }

  async saveTasks(tasks: Task[]) {
    tasks.forEach((t) => this.guard(t));
    const rows = check<Row[]>(await this.sb.from('tasks').upsert(tasks.map((t) => fromTask(t, this.schoolId))).select());
    return rows.map((r: Row) => toTask(r, new Set()));
  }

  async deleteTask(id: string) {
    check(await this.sb.from('tasks').delete().eq('id', id));
  }

  async setTaskDone(id: string, done: boolean) {
    if (done) check(await this.sb.from('task_progress').upsert({ task_id: id, user_id: this.userId }));
    else check(await this.sb.from('task_progress').delete().eq('task_id', id).eq('user_id', this.userId));
  }

  async saveDuty(duty: Duty) {
    if (hasBlockingPii(duty.name)) throw new PiiBlockedError();
    check(await this.sb.from('duties').upsert({ id: duty.id, school_id: this.schoolId, name: duty.name, kind: duty.kind }));
    return duty;
  }

  async deleteDuty(id: string) {
    check(await this.sb.from('duties').delete().eq('id', id));
  }

  async saveCard(card: HandoverCard) {
    if (hasBlockingPii(card.title, card.tips, card.locationPath)) throw new PiiBlockedError();
    const row = check<Row>(
      await this.sb
        .from('handover_cards')
        .upsert({ id: card.id, school_id: this.schoolId, duty_id: card.dutyId, title: card.title, tips: card.tips, location_path: card.locationPath })
        .select()
        .single()
    );
    return toCard(row);
  }

  async deleteCard(id: string) {
    check(await this.sb.from('handover_cards').delete().eq('id', id));
  }

  async exportJson() {
    return JSON.stringify(await this.load(), null, 2);
  }
}

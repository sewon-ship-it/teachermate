import type { AppData, Duty, HandoverCard, Task } from '../lib/types';
import { buildSampleData } from '../lib/sampleData';
import { hasBlockingPii } from '../lib/piiGuard';
import { PiiBlockedError, type Repo } from './repo';

const KEY = 'teachermate:v1';

/**
 * 로컬 체험 모드.
 * localStorage 는 암호화된 저장소가 아니다. 같은 PC·브라우저 프로필을 쓰는 사람은 볼 수 있고,
 * 브라우저 데이터를 지우면 함께 사라진다. 그래서 샘플·비식별 자료 시연용으로만 쓴다.
 */
export class LocalRepo implements Repo {
  mode = 'local' as const;

  private read(): AppData {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as AppData;
    } catch {
      /* 손상된 데이터는 샘플로 초기화 */
    }
    const seed = buildSampleData();
    this.write(seed);
    return seed;
  }

  private write(data: AppData) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  private guardTask(t: Task) {
    if (hasBlockingPii(t.title, t.note, t.locationPath, ...t.checklist.map((c) => c.text), ...t.sources.map((s) => s.excerpt))) {
      throw new PiiBlockedError();
    }
  }

  async load() {
    return this.read();
  }

  async saveTask(task: Task) {
    this.guardTask(task);
    const data = this.read();
    const saved = { ...task, updatedAt: new Date().toISOString() };
    const i = data.tasks.findIndex((t) => t.id === task.id);
    if (i >= 0) data.tasks[i] = saved;
    else data.tasks.push(saved);
    this.write(data);
    return saved;
  }

  async saveTasks(tasks: Task[]) {
    tasks.forEach((t) => this.guardTask(t));
    const out: Task[] = [];
    for (const t of tasks) out.push(await this.saveTask(t));
    return out;
  }

  async deleteTask(id: string) {
    const data = this.read();
    data.tasks = data.tasks.filter((t) => t.id !== id);
    this.write(data);
  }

  async setTaskDone(id: string, done: boolean) {
    const data = this.read();
    const t = data.tasks.find((x) => x.id === id);
    if (t) t.done = done;
    this.write(data);
  }

  async saveDuty(duty: Duty) {
    if (hasBlockingPii(duty.name)) throw new PiiBlockedError();
    const data = this.read();
    const i = data.duties.findIndex((d) => d.id === duty.id);
    if (i >= 0) data.duties[i] = duty;
    else data.duties.push(duty);
    this.write(data);
    return duty;
  }

  async deleteDuty(id: string) {
    const data = this.read();
    data.duties = data.duties.filter((d) => d.id !== id);
    data.tasks = data.tasks.map((t) => (t.dutyId === id ? { ...t, dutyId: null } : t));
    data.cards = data.cards.map((c) => (c.dutyId === id ? { ...c, dutyId: null } : c));
    this.write(data);
  }

  async saveCard(card: HandoverCard) {
    if (hasBlockingPii(card.title, card.tips, card.locationPath)) throw new PiiBlockedError();
    const data = this.read();
    const saved = { ...card, updatedAt: new Date().toISOString() };
    const i = data.cards.findIndex((c) => c.id === card.id);
    if (i >= 0) data.cards[i] = saved;
    else data.cards.push(saved);
    this.write(data);
    return saved;
  }

  async deleteCard(id: string) {
    const data = this.read();
    data.cards = data.cards.filter((c) => c.id !== id);
    this.write(data);
  }

  async exportJson() {
    return JSON.stringify(this.read(), null, 2);
  }

  /** 이 브라우저에 저장된 TeacherMate 데이터 전체 삭제 */
  clearAll() {
    localStorage.removeItem(KEY);
  }

  resetToSample() {
    this.write(buildSampleData());
  }
}

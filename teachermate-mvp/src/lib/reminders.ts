import type { Task } from './types';
import { daysBetween } from './dates';

export interface ReminderGroups {
  overdue: Task[];
  soon: Task[]; // D-day ~ D-1
  week: Task[]; // D-2 ~ D-7
}

/** 교사가 '확정'한 미완료 업무만 알린다. 초안은 알리지 않는다. */
export function groupReminders(tasks: Task[], today: string): ReminderGroups {
  const g: ReminderGroups = { overdue: [], soon: [], week: [] };
  for (const t of tasks) {
    if (t.status !== 'confirmed' || t.done || !t.dueDate) continue;
    const diff = daysBetween(today, t.dueDate);
    if (diff < 0) g.overdue.push(t);
    else if (diff <= 1) g.soon.push(t);
    else if (diff <= 7) g.week.push(t);
  }
  const byDate = (a: Task, b: Task) => (a.dueDate! < b.dueDate! ? -1 : 1);
  g.overdue.sort(byDate);
  g.soon.sort(byDate);
  g.week.sort(byDate);
  return g;
}

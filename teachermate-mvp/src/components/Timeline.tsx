import { useEffect, useMemo, useState } from 'react';
import type { Duty, Task } from '../lib/types';
import { monthOf, parseISO, yearForMonth, schoolYearOf } from '../lib/dates';
import { newId } from '../lib/id';
import { YearStrip } from './YearStrip';
import { TaskItem } from './TaskItem';

interface Props {
  tasks: Task[];
  duties: Duty[];
  today: string;
  month: number;
  setMonth: (m: number) => void;
  myDuties: string[];
  setMyDuties: (ids: string[]) => void;
  onSave: (t: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  /** 리마인더·챗봇에서 특정 Task를 열도록 요청하는 ID */
  jumpTaskId?: string | null;
  onJumpHandled?: () => void;
}

const weekOfMonth = (iso: string) => Math.ceil(parseISO(iso).getDate() / 7);

export function Timeline(p: Props) {
  const [onlyMine, setOnlyMine] = useState(p.myDuties.length > 0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'confirmed'>('all');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const sy = schoolYearOf(p.today);

  // jumpTaskId가 오면 해당 월로 이동 + 해당 항목 열기
  useEffect(() => {
    if (!p.jumpTaskId) return;
    setOpenTaskId(p.jumpTaskId);
    p.onJumpHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.jumpTaskId]);

  const visible = useMemo(
    () =>
      p.tasks.filter((t) => {
        if (onlyMine && p.myDuties.length && !(t.dutyId === null || p.myDuties.includes(t.dutyId))) return false;
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        return true;
      }),
    [p.tasks, onlyMine, p.myDuties, statusFilter]
  );

  const inMonth = visible.filter((t) => t.dueDate && monthOf(t.dueDate) === p.month).sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));
  const undated = visible.filter((t) => !t.dueDate);
  const weeks = new Map<number, Task[]>();
  for (const t of inMonth) {
    const w = weekOfMonth(t.dueDate!);
    weeks.set(w, [...(weeks.get(w) ?? []), t]);
  }

  const addTask = () => {
    const y = yearForMonth(sy, p.month);
    p.onSave({
      id: newId(), dutyId: p.myDuties[0] ?? null, title: '새 할 일', note: '',
      dueDate: `${y}-${String(p.month).padStart(2, '0')}-01`,
      status: 'draft', origin: 'manual', checklist: [], sources: [],
      locationPath: '', done: false, updatedAt: '',
    });
  };

  const item = (t: Task) => (
    <TaskItem
      key={t.id}
      task={t}
      duties={p.duties}
      today={p.today}
      onSave={p.onSave}
      onDelete={p.onDelete}
      onToggleDone={p.onToggleDone}
      forceOpen={openTaskId === t.id}
      onOpen={() => setOpenTaskId(t.id)}
      onClose={() => setOpenTaskId(null)}
    />
  );

  return (
    <section className="timeline">
      <header className="timeline-head">
        <h1>{sy}학년도 업무 지도</h1>
        <YearStrip tasks={visible} selected={p.month} currentMonth={monthOf(p.today)} onSelect={p.setMonth} />
        <div className="filters">
          <fieldset className="duty-picker">
            <legend>내 업무분장</legend>
            {p.duties.map((d) => (
              <label key={d.id} className="chip">
                <input
                  type="checkbox"
                  checked={p.myDuties.includes(d.id)}
                  onChange={(e) =>
                    p.setMyDuties(e.target.checked ? [...p.myDuties, d.id] : p.myDuties.filter((x) => x !== d.id))
                  }
                />
                {d.name}
              </label>
            ))}
          </fieldset>
          <label className="inline">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
            내 업무만 보기
          </label>
          <label className="inline">
            상태
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="all">전체</option>
              <option value="draft">초안만</option>
              <option value="confirmed">확정만</option>
            </select>
          </label>
        </div>
      </header>

      <div className="month-body">
        <div className="month-title">
          <h2>{p.month}월</h2>
          <button type="button" className="btn" onClick={addTask}>
            + 이 달에 할 일 추가
          </button>
        </div>
        {inMonth.length === 0 && (
          <p className="empty">이 달에는 아직 할 일이 없다. 학사력이나 업무 자료를 불러오면 채워진다.</p>
        )}
        {Array.from(weeks.entries()).map(([w, list]) => (
          <section key={w} className="week">
            <h3>{w}주</h3>
            <ul className="task-list">{list.map(item)}</ul>
          </section>
        ))}
        {undated.length > 0 && (
          <section className="week week-undated">
            <h3>날짜 확인 필요</h3>
            <p className="hint">원문에서 날짜를 찾지 못한 일이다. 날짜를 넣고 확정해야 알림이 온다.</p>
            <ul className="task-list">{undated.map(item)}</ul>
          </section>
        )}
      </div>
    </section>
  );
}

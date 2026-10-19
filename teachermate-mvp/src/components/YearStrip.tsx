import type { Task } from '../lib/types';
import { SCHOOL_MONTHS, monthOf } from '../lib/dates';

interface Props {
  tasks: Task[];
  selected: number;
  currentMonth: number;
  onSelect: (m: number) => void;
}

/** 학년도 12개월 띠. 이번 달은 형광펜으로 칠하고, 막대 높이로 업무량을 보여 준다. */
export function YearStrip({ tasks, selected, currentMonth, onSelect }: Props) {
  const counts = new Map<number, { total: number; open: number }>();
  for (const t of tasks) {
    if (!t.dueDate) continue;
    const m = monthOf(t.dueDate);
    const c = counts.get(m) ?? { total: 0, open: 0 };
    c.total++;
    if (!t.done) c.open++;
    counts.set(m, c);
  }
  const max = Math.max(1, ...Array.from(counts.values(), (c) => c.total));

  return (
    <nav className="year-strip" aria-label="월 선택">
      {SCHOOL_MONTHS.map((m) => {
        const c = counts.get(m) ?? { total: 0, open: 0 };
        return (
          <button
            key={m}
            type="button"
            className={`month-cell${m === selected ? ' is-selected' : ''}${m === currentMonth ? ' is-now' : ''}`}
            aria-pressed={m === selected}
            aria-label={`${m}월, 할 일 ${c.total}건 중 남은 일 ${c.open}건`}
            onClick={() => onSelect(m)}
          >
            <span className="month-bar" style={{ height: `${(c.total / max) * 100}%` }}>
              <span className="month-bar-open" style={{ height: c.total ? `${(c.open / c.total) * 100}%` : 0 }} />
            </span>
            <span className="month-label">{m}월</span>
          </button>
        );
      })}
    </nav>
  );
}

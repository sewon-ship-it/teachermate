import type { Duty, Task } from '../lib/types';
import { groupReminders } from '../lib/reminders';
import { buildIcs } from '../lib/ics';
import { DDay, download } from './ui';

interface Props {
  tasks: Task[];
  duties: Duty[];
  today: string;
  onJump: (t: Task) => void;
}

export function ReminderPanel({ tasks, duties, today, onJump }: Props) {
  const g = groupReminders(tasks, today);
  const draftCount = tasks.filter((t) => t.status === 'draft').length;
  const groups: Array<[string, Task[]]> = [
    ['🔴 기한이 지났다', g.overdue],
    ['🟡 오늘·내일', g.soon],
    ['🔵 이번 주 안 (D-7)', g.week],
  ];
  const empty = groups.every(([, list]) => list.length === 0);

  return (
    <aside className="reminders" aria-label="다가오는 할 일">
      <h2>다가오는 할 일</h2>
      {empty && <p className="muted">7일 안에 마감인 확정 업무가 없다.</p>}
      {groups.map(([label, list]) =>
        list.length ? (
          <section key={label}>
            <h3>{label}</h3>
            <ul>
              {list.map((t) => {
                const duty = duties.find((d) => d.id === t.dutyId);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      className="reminder-item"
                      title="클릭하면 타임라인에서 이 항목을 바로 엽니다"
                      onClick={() => onJump(t)}
                    >
                      <DDay due={t.dueDate} today={today} />
                      <span>
                        {duty && <span className="duty-tag" style={{ marginRight: '.3rem' }}>{duty.name}</span>}
                        {t.title}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null
      )}
      <p className="hint">
        확정한 일만 알려 준다.
        {draftCount > 0 && ` 확인을 기다리는 초안이 ${draftCount}건 있다.`}
        {' '}클릭하면 해당 항목을 바로 열 수 있다.
      </p>
      <button
        type="button"
        className="btn btn-block"
        onClick={() => download('teachermate-업무일정.ics', buildIcs(tasks, duties), 'text/calendar;charset=utf-8')}
      >
        📱 내 캘린더로 내보내기 (.ics)
      </button>
      <p className="hint">휴대폰·구글·네이버 캘린더에서 가져오면 D-7, D-1 오전 9시에 알림이 온다. 앱을 닫아 두어도 울린다.</p>
    </aside>
  );
}

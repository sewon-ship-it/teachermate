import { useEffect, useMemo, useState } from 'react';
import type { Duty, HandoverCard, Task } from '../lib/types';
import { monthOf, parseISO, yearForMonth, schoolYearOf } from '../lib/dates';
import { newId } from '../lib/id';
import { YearStrip } from './YearStrip';
import { TaskItem } from './TaskItem';
import type { JungdaeEvent } from '../data/jungdaeData';

interface Props {
  tasks: Task[];
  duties: Duty[];
  cards: HandoverCard[];
  events?: JungdaeEvent[];
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
  const [viewMode, setViewMode] = useState<'calendar' | 'checklist'>('calendar');
  const [tagFilter, setTagFilter] = useState<'all' | 'event' | 'draft' | 'receive' | 'todo'>('all');
  const [dutyFilter, setDutyFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const sy = schoolYearOf(p.today);

  // jumpTaskId가 오면 해당 월로 이동 + 해당 항목 열기
  useEffect(() => {
    if (!p.jumpTaskId) return;
    setOpenTaskId(p.jumpTaskId);
    p.onJumpHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p.jumpTaskId]);

  // 태스크의 4단계 유형 판별 헬퍼
  const getTaskType = (t: Task): 'draft' | 'receive' | 'todo' => {
    if (t.title.includes('기안') || t.title.includes('계획') || t.title.includes('품의')) return 'draft';
    if (t.title.includes('공문') || t.title.includes('보고') || t.title.includes('접수') || t.title.includes('제출')) return 'receive';
    return 'todo';
  };

  // 해당 월의 학교 행사 (중대부초 199개 행사 기준)
  const monthEvents = useMemo(() => {
    if (!p.events) return [];
    return p.events.filter((e) => {
      const m = parseInt(e.date.split('-')[1], 10);
      if (m !== p.month) return false;
      if (tagFilter !== 'all' && tagFilter !== 'event') return false;
      if (search && !e.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [p.events, p.month, tagFilter, search]);

  // 필터링된 태스크 목록
  const visibleTasks = useMemo(() => {
    return p.tasks.filter((t) => {
      // 부서 필터
      if (dutyFilter !== 'all' && t.dutyId !== dutyFilter) return false;
      // 태그 필터
      const tp = getTaskType(t);
      if (tagFilter === 'event') return false;
      if (tagFilter !== 'all' && tagFilter !== tp) return false;
      // 검색어 필터
      if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.note.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [p.tasks, dutyFilter, tagFilter, search]);

  const inMonthTasks = visibleTasks
    .filter((t) => t.dueDate && monthOf(t.dueDate) === p.month)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));

  const undatedTasks = visibleTasks.filter((t) => !t.dueDate);

  // 주차별 그룹화
  const weeks = new Map<number, Task[]>();
  for (const t of inMonthTasks) {
    const w = weekOfMonth(t.dueDate!);
    weeks.set(w, [...(weeks.get(w) ?? []), t]);
  }

  const addTask = (tp: 'draft' | 'receive' | 'todo' = 'todo') => {
    const y = yearForMonth(sy, p.month);
    const prefix = tp === 'draft' ? '[기안] ' : tp === 'receive' ? '[공문] ' : '';
    p.onSave({
      id: newId(),
      dutyId: dutyFilter !== 'all' ? dutyFilter : p.myDuties[0] ?? null,
      title: `${prefix}새 업무`,
      note: '',
      dueDate: `${y}-${String(p.month).padStart(2, '0')}-01`,
      status: 'confirmed',
      origin: 'manual',
      checklist: [{ id: newId(), text: '업무 내용 확인 및 추진', done: false }],
      sources: [],
      locationPath: '',
      done: false,
      updatedAt: '',
    });
  };

  const renderTaskItem = (t: Task) => (
    <TaskItem
      key={t.id}
      task={t}
      duties={p.duties}
      cards={p.cards}
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
      {/* ── 헤더: 가동초 스타일 월별 띠 및 뷰 스위치 ── */}
      <header className="timeline-head" style={{ paddingBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div>
            <h1 style={{ fontSize: '22px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🏫</span> 중대부초 2026 1년 업무 길잡이
            </h1>
            <p className="hint" style={{ margin: '4px 0 0' }}>
              중앙대학교사범대학부속초등학교 실제 학사력과 4단계 업무 체계입니다.
            </p>
          </div>
          <div className="view-switch" style={{ display: 'flex', gap: '4px', background: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              style={{
                border: 0,
                background: viewMode === 'calendar' ? '#fff' : 'transparent',
                color: viewMode === 'calendar' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setViewMode('calendar')}
            >
              🗓️ 월별 달력
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === 'checklist' ? 'active' : ''}`}
              style={{
                border: 0,
                background: viewMode === 'checklist' ? '#fff' : 'transparent',
                color: viewMode === 'checklist' ? '#0f172a' : '#64748b',
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: viewMode === 'checklist' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setViewMode('checklist')}
            >
              ✅ 이번 달 할 일 ({inMonthTasks.filter((t) => !t.done).length})
            </button>
          </div>
        </div>

        {/* 12개월 선택 바 */}
        <YearStrip tasks={visibleTasks} selected={p.month} currentMonth={monthOf(p.today)} onSelect={p.setMonth} />

        {/* ── 가동초 스타일: 4단계 컬러 필터 바 ── */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px 14px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569', minWidth: '60px' }}>분류 필터:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`gfilter-btn ${tagFilter === 'all' ? 'active' : ''}`}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer',
                  background: tagFilter === 'all' ? '#0f172a' : '#fff', color: tagFilter === 'all' ? '#fff' : '#334155',
                  border: '1px solid #cbd5e1'
                }}
                onClick={() => setTagFilter('all')}
              >
                전체보기
              </button>
              <button
                type="button"
                className={`gfilter-btn ${tagFilter === 'event' ? 'active' : ''}`}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                  background: tagFilter === 'event' ? '#0284c7' : '#e0f2fe', color: tagFilter === 'event' ? '#fff' : '#0369a1',
                  border: '1px solid #bae6fd'
                }}
                onClick={() => setTagFilter('event')}
              >
                📅 학교 행사 ({monthEvents.length})
              </button>
              <button
                type="button"
                className={`gfilter-btn ${tagFilter === 'draft' ? 'active' : ''}`}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                  background: tagFilter === 'draft' ? '#d97706' : '#fef3c7', color: tagFilter === 'draft' ? '#fff' : '#b45309',
                  border: '1px solid #fde68a'
                }}
                onClick={() => setTagFilter('draft')}
              >
                ✍️ 기안 문서
              </button>
              <button
                type="button"
                className={`gfilter-btn ${tagFilter === 'receive' ? 'active' : ''}`}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                  background: tagFilter === 'receive' ? '#16a34a' : '#dcfce7', color: tagFilter === 'receive' ? '#fff' : '#15803d',
                  border: '1px solid #bbf7d0'
                }}
                onClick={() => setTagFilter('receive')}
              >
                📥 접수 공문
              </button>
              <button
                type="button"
                className={`gfilter-btn ${tagFilter === 'todo' ? 'active' : ''}`}
                style={{
                  padding: '5px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
                  background: tagFilter === 'todo' ? '#9333ea' : '#f3e8ff', color: tagFilter === 'todo' ? '#fff' : '#7e22ce',
                  border: '1px solid #e9d5ff'
                }}
                onClick={() => setTagFilter('todo')}
              >
                ⏳ 예정 업무
              </button>
            </div>

            {/* 검색창 */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
              <input
                type="search"
                placeholder="🔍 행사·업무 검색"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '4px 10px', fontSize: '12.5px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '180px' }}
              />
            </div>
          </div>

          {/* 부서/업무분장 칩 필터 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>부서 선택:</span>
            <button
              type="button"
              className={`chip ${dutyFilter === 'all' ? 'is-active' : ''}`}
              style={{ fontSize: '11.5px', padding: '3px 9px', borderRadius: '12px', border: '1px solid #cbd5e1', background: dutyFilter === 'all' ? '#0f172a' : '#fff', color: dutyFilter === 'all' ? '#fff' : '#475569', cursor: 'pointer' }}
              onClick={() => setDutyFilter('all')}
            >
              전체 부서
            </button>
            {p.duties.map((d) => (
              <button
                key={d.id}
                type="button"
                className={`chip ${dutyFilter === d.id ? 'is-active' : ''}`}
                style={{
                  fontSize: '11.5px', padding: '3px 9px', borderRadius: '12px', border: '1px solid #cbd5e1',
                  background: dutyFilter === d.id ? '#0f172a' : '#fff', color: dutyFilter === d.id ? '#fff' : '#475569',
                  cursor: 'pointer'
                }}
                onClick={() => setDutyFilter(dutyFilter === d.id ? 'all' : d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── 본문 ── */}
      <div className="month-body">
        <div className="month-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '20px', margin: 0 }}>
              {p.month}월 <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>({dutyFilter === 'all' ? '전체 부서' : p.duties.find((d) => d.id === dutyFilter)?.name})</span>
            </h2>
            <p className="hint" style={{ margin: '2px 0 0' }}>
              학교 행사 {monthEvents.length}건 · 업무 {inMonthTasks.length}건
            </p>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="button" className="btn btn-small" onClick={() => addTask('draft')} style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' }}>
              + ✍️ 기안 작성
            </button>
            <button type="button" className="btn btn-small" onClick={() => addTask('todo')}>
              + ⏳ 할 일 추가
            </button>
          </div>
        </div>

        {/* ── 모드 1: 이번 달 할 일 체크리스트 집중 뷰 ── */}
        {viewMode === 'checklist' && (
          <div className="checklist-focus-view" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inMonthTasks.length === 0 ? (
              <p className="empty">이 달에 등록된 업무 체크리스트가 없습니다.</p>
            ) : (
              inMonthTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: t.done ? '#f8fafc' : '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => p.onToggleDone(t.id, e.target.checked)}
                    style={{ width: '20px', height: '20px', marginTop: '2px', accentColor: '#0f172a', cursor: 'pointer' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                          background: getTaskType(t) === 'draft' ? '#fef3c7' : getTaskType(t) === 'receive' ? '#dcfce7' : '#f3e8ff',
                          color: getTaskType(t) === 'draft' ? '#b45309' : getTaskType(t) === 'receive' ? '#15803d' : '#7e22ce'
                        }}
                      >
                        {getTaskType(t) === 'draft' ? '✍️ 기안 문서' : getTaskType(t) === 'receive' ? '📥 접수 공문' : '⏳ 예정 업무'}
                      </span>
                      <strong
                        style={{ fontSize: '15px', textDecoration: t.done ? 'line-through' : 'none', color: t.done ? '#94a3b8' : '#0f172a', cursor: 'pointer' }}
                        onClick={() => setOpenTaskId(openTaskId === t.id ? null : t.id)}
                      >
                        {t.title}
                      </strong>
                      <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto' }}>
                        📅 {t.dueDate} 마감
                      </span>
                    </div>
                    {t.checklist.length > 0 && (
                      <div style={{ marginTop: '8px', paddingLeft: '8px', borderLeft: '2px solid #cbd5e1' }}>
                        {t.checklist.map((c) => (
                          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', margin: '4px 0', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={c.done}
                              onChange={(e) => {
                                const updated = t.checklist.map((x) => (x.id === c.id ? { ...x, done: e.target.checked } : x));
                                p.onSave({ ...t, checklist: updated });
                              }}
                            />
                            <span style={{ textDecoration: c.done ? 'line-through' : 'none' }}>{c.text}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── 모드 2: 가동초 스타일 월별 달력 / 타임라인 뷰 ── */}
        {viewMode === 'calendar' && (
          <div>
            {/* 해당 월 학교 행사 배너 (중대부초 199개 행사 실시간 표시) */}
            {monthEvents.length > 0 && (
              <div style={{ marginBottom: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0369a1', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📅</span> {p.month}월 중대부초 주요 행사 ({monthEvents.length}건)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                  {monthEvents.map((ev, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0284c7', background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                        {ev.date.slice(5)}
                      </span>
                      <strong style={{ fontSize: '13.5px', color: '#0369a1' }}>{ev.title}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 주차별 업무 목록 */}
            {inMonthTasks.length === 0 && monthEvents.length === 0 ? (
              <p className="empty">이 달에 등록된 행사나 업무가 없습니다.</p>
            ) : (
              Array.from(weeks.entries()).map(([w, list]) => (
                <section key={w} className="week" style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '8px' }}>
                    {p.month}월 {w}주차
                  </h3>
                  <ul className="task-list">{list.map(renderTaskItem)}</ul>
                </section>
              ))
            )}

            {undatedTasks.length > 0 && (
              <section className="week week-undated" style={{ marginTop: '20px' }}>
                <h3>날짜 확인 필요</h3>
                <p className="hint">날짜를 지정하고 확정하면 달력과 리마인더에 표시됩니다.</p>
                <ul className="task-list">{undatedTasks.map(renderTaskItem)}</ul>
              </section>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

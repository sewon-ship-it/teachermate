import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppData, Duty, HandoverCard, Task } from './lib/types';
import { monthOf, todayISO } from './lib/dates';
import type { Repo } from './data/repo';
import { LocalRepo } from './data/localRepo';
import { SupabaseRepo } from './data/supabaseRepo';
import { aiEnabled, supabase } from './data/supabaseClient';
import { AuthGate, type SchoolInfo } from './components/AuthGate';
import { Timeline } from './components/Timeline';
import { ReminderPanel } from './components/ReminderPanel';
import { CalendarImport } from './components/CalendarImport';
import { FlowBuilder } from './components/FlowBuilder';
import { Handover } from './components/Handover';
import { Settings } from './components/Settings';
import { SchoolChatbot } from './components/SchoolChatbot';

type View = 'timeline' | 'calendar' | 'flow' | 'handover' | 'chatbot' | 'settings';

const VIEWS: Array<[View, string, string]> = [
  ['timeline',  '1년 업무 지도',    '📅'],
  ['calendar',  '학사력 불러오기',   '📆'],
  ['flow',      '자료 → 업무 흐름', '📋'],
  ['handover',  '업무 인수인계',     '🤝'],
  ['chatbot',   '학교 업무 챗봇',   '💬'],
  ['settings',  '데이터·보안',      '⚙️'],
];

const MY_DUTIES_KEY = 'teachermate:myDuties';

export default function App() {
  if (supabase) {
    return (
      <AuthGate sb={supabase}>
        {({ session, school, signOut }) => (
          <Workspace
            repo={new SupabaseRepo(supabase!, school.id, session.user.id)}
            key={school.id}
            school={school}
            signOut={signOut}
            onCreateInvite={async () => {
              const { data, error } = await supabase!.rpc('create_invite', { sid: school.id });
              if (error) throw new Error(error.message);
              return data as string;
            }}
          />
        )}
      </AuthGate>
    );
  }
  return <LocalApp />;
}

function LocalApp() {
  const repo = useMemo(() => new LocalRepo(), []);
  return <Workspace repo={repo} school={null} />;
}

interface WorkspaceProps {
  repo: Repo;
  school: SchoolInfo | null;
  signOut?: () => Promise<void>;
  onCreateInvite?: () => Promise<string>;
}

function Workspace({ repo, school, signOut, onCreateInvite }: WorkspaceProps) {
  const today = todayISO();
  const [view, setView] = useState<View>('timeline');
  const [data, setData] = useState<AppData | null>(null);
  const [month, setMonth] = useState(monthOf(today));
  const [toast, setToast] = useState('');
  const [jumpTaskId, setJumpTaskId] = useState<string | null>(null);
  const [myDuties, setMyDutiesState] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(MY_DUTIES_KEY) ?? '[]'); }
    catch { return []; }
  });

  const setMyDuties = (ids: string[]) => {
    setMyDutiesState(ids);
    localStorage.setItem(MY_DUTIES_KEY, JSON.stringify(ids));
  };

  const reload = useCallback(async () => {
    try { setData(await repo.load()); }
    catch (e: any) { setToast(e.message ?? '불러오지 못했다.'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school?.id]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const run = async (fn: () => Promise<unknown>, ok?: string) => {
    try {
      await fn();
      await reload();
      if (ok) setToast(ok);
    } catch (e: any) {
      setToast(e.message ?? '저장하지 못했다.');
    }
  };

  if (!data) return <p className="center muted">불러오는 중…</p>;

  const saveTask  = (t: Task) => run(() => repo.saveTask(t), '저장했다.');
  const addTasks  = (ts: Task[]) =>
    run(async () => {
      await repo.saveTasks(ts);
      setView('timeline');
      const first = ts.find((t) => t.dueDate);
      if (first) setMonth(monthOf(first.dueDate!));
    }, `${ts.length}건을 초안으로 추가했다. 확인 후 확정한다.`);

  // 리마인더 클릭 → 타임라인 해당 월·항목 이동
  const handleJump = (t: Task) => {
    if (t.dueDate) setMonth(monthOf(t.dueDate));
    setJumpTaskId(t.id);
    setView('timeline');
  };

  // 챗봇에서 태스크 카드 조회
  const handleChatJump = (taskId: string) => {
    const t = data.tasks.find((x) => x.id === taskId);
    if (t) handleJump(t);
  };

  // 드래프트 수
  const draftCount = data.tasks.filter((t) => t.status === 'draft').length;

  return (
    <div className="app">
      <a className="skip" href="#main">본문으로 건너뛰기</a>

      {/* ── 최상단 헤더 ── */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">📚</span>
          <span className="brand-name">TeacherMate</span>
          {school && <span className="brand-school">{school.name}</span>}
          {!school && <span className="brand-school" style={{ color: '#85a8d8' }}>체험 모드</span>}
        </div>
        <div className="topbar-right">
          {signOut && <button type="button" className="btn-link" onClick={signOut}>로그아웃</button>}
        </div>
      </header>

      {/* ── NEIS 스타일 탭 네비 ── */}
      <nav className="subnav" aria-label="주 메뉴">
        {VIEWS.map(([v, label, icon]) => (
          <button
            key={v}
            type="button"
            className={`nav-btn${view === v ? ' is-active' : ''}`}
            aria-current={view === v ? 'page' : undefined}
            onClick={() => setView(v)}
          >
            <span>{icon}</span>
            {label}
            {v === 'timeline' && draftCount > 0 && (
              <span className="nav-badge">{draftCount}</span>
            )}
          </button>
        ))}
      </nav>

      <div className={`layout${view === 'timeline' ? ' with-aside' : ''}`}>
        <main id="main">
          {view === 'timeline' && (
            <Timeline
              tasks={data.tasks} duties={data.duties} today={today}
              month={month} setMonth={setMonth}
              myDuties={myDuties} setMyDuties={setMyDuties}
              onSave={saveTask}
              onDelete={(id) => run(() => repo.deleteTask(id), '삭제했다.')}
              onToggleDone={(id, done) => run(() => repo.setTaskDone(id, done))}
              jumpTaskId={jumpTaskId}
              onJumpHandled={() => setJumpTaskId(null)}
            />
          )}
          {view === 'calendar' && <CalendarImport duties={data.duties} today={today} onAdd={addTasks} />}
          {view === 'flow' && (
            <FlowBuilder
              duties={data.duties} today={today}
              schoolId={school?.id ?? null}
              aiAvailable={aiEnabled && !!school}
              onAdd={addTasks}
            />
          )}
          {view === 'handover' && (
            <Handover
              cards={data.cards} duties={data.duties} tasks={data.tasks}
              onSave={(c: HandoverCard) => run(() => repo.saveCard(c), '카드를 저장했다.')}
              onDelete={(id) => run(() => repo.deleteCard(id), '카드를 삭제했다.')}
            />
          )}
          {view === 'chatbot' && (
            <SchoolChatbot
              tasks={data.tasks}
              cards={data.cards}
              duties={data.duties}
              onJumpTask={handleChatJump}
            />
          )}
          {view === 'settings' && (
            <Settings
              repo={repo} duties={data.duties} school={school}
              onReload={reload} onCreateInvite={onCreateInvite} onSignOut={signOut}
              onSaveDuty={(d: Duty) => run(() => repo.saveDuty(d), '업무분장을 추가했다.')}
              onDeleteDuty={(id) => run(() => repo.deleteDuty(id))}
            />
          )}
        </main>

        {view === 'timeline' && (
          <ReminderPanel
            tasks={data.tasks} duties={data.duties} today={today}
            onJump={handleJump}
          />
        )}
      </div>

      <footer className="foot">
        AI가 만든 내용은 초안이다. 최종 결정은 교사가 하며 교육청 지침과 학교 결재가 우선한다.
      </footer>
      <div className="toast" role="status" aria-live="polite">{toast}</div>
    </div>
  );
}

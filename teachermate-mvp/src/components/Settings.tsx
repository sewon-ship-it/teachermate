import { useState } from 'react';
import type { Duty, DutyKind } from '../lib/types';
import type { Repo } from '../data/repo';
import { LocalRepo } from '../data/localRepo';
import { newId } from '../lib/id';
import { download } from './ui';

interface Props {
  repo: Repo;
  duties: Duty[];
  onSaveDuty: (d: Duty) => Promise<void>;
  onDeleteDuty: (id: string) => Promise<void>;
  onReload: () => Promise<void>;
  school?: { id: string; name: string; role: string } | null;
  onCreateInvite?: () => Promise<string>;
  onSignOut?: () => Promise<void>;
}

const KIND_LABEL: Record<DutyKind, string> = { homeroom: '담임 공통', grade: '학년', duty: '부서·개별 업무' };

export function Settings({ repo, duties, onSaveDuty, onDeleteDuty, onReload, school, onCreateInvite, onSignOut }: Props) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<DutyKind>('duty');
  const [invite, setInvite] = useState('');

  return (
    <section className="panel">
      <h1>데이터·보안</h1>

      <h2>업무분장</h2>
      <p className="hint">담당자는 실명 대신 업무분장 이름으로 표기한다. (예: 6학년 부장, 정보 담당)</p>
      <ul className="duty-list">
        {duties.map((d) => (
          <li key={d.id}>
            <span>{d.name}</span> <span className="muted">{KIND_LABEL[d.kind]}</span>
            <button type="button" className="btn-link" onClick={() => confirm(`'${d.name}'을(를) 지울까? 연결된 할 일은 '지정 안 함'이 된다.`) && onDeleteDuty(d.id)}>
              지우기
            </button>
          </li>
        ))}
      </ul>
      <div className="field-row tight">
        <input aria-label="업무분장 이름" placeholder="예: 체육 담당" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
        <select aria-label="종류" value={kind} onChange={(e) => setKind(e.target.value as DutyKind)}>
          {Object.entries(KIND_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button
          type="button"
          className="btn"
          disabled={!name.trim()}
          onClick={async () => {
            await onSaveDuty({ id: newId(), name: name.trim(), kind });
            setName('');
          }}
        >
          추가
        </button>
      </div>

      <h2>저장 위치</h2>
      {repo.mode === 'local' ? (
        <div className="notice notice-warn">
          <strong>로컬 체험 모드</strong>
          <p>
            지금은 이 브라우저(localStorage)에만 저장된다. 암호화된 저장소가 아니어서 같은 PC·브라우저를 쓰는 사람은 볼 수 있고, 브라우저 데이터를 지우면 함께 사라진다. 샘플이나 비식별 자료로 시연할 때만 쓴다.
          </p>
        </div>
      ) : (
        <div className="notice notice-info">
          <strong>학교 계정 모드 · {school?.name}</strong>
          <p>
            학교 서버(Supabase, Postgres)에 저장된다. 데이터베이스의 행 단위 보안(RLS) 정책으로 같은 학교 구성원만 읽고 쓸 수 있다. 내 역할: {school?.role === 'admin' ? '학교 관리자' : '교사'}
          </p>
        </div>
      )}

      <div className="actions">
        <button type="button" className="btn" onClick={async () => download('teachermate-백업.json', await repo.exportJson(), 'application/json')}>
          데이터 내보내기 (JSON)
        </button>
        {repo instanceof LocalRepo && (
          <>
            <button
              type="button"
              className="btn"
              onClick={async () => {
                if (confirm('지금 데이터를 지우고 샘플로 되돌릴까?')) {
                  repo.resetToSample();
                  await onReload();
                }
              }}
            >
              샘플로 되돌리기
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                if (confirm('이 브라우저에 저장된 TeacherMate 데이터를 모두 지울까? 되돌릴 수 없다.')) {
                  repo.clearAll();
                  await onReload();
                }
              }}
            >
              이 브라우저의 데이터 모두 지우기
            </button>
          </>
        )}
      </div>

      {school?.role === 'admin' && onCreateInvite && (
        <>
          <h2>교사 초대</h2>
          <p className="hint">초대 코드는 7일 동안, 30명까지 쓸 수 있다.</p>
          <div className="field-row">
            <button type="button" className="btn" onClick={async () => setInvite(await onCreateInvite())}>
              초대 코드 만들기
            </button>
            {invite && <code className="invite">{invite}</code>}
          </div>
        </>
      )}

      <h2>이 앱이 지키는 원칙</h2>
      <ul className="principles">
        <li>학생 명단·연락처·주민등록번호가 보이면 입력 단계에서 막는다. 서버와 데이터베이스에서도 한 번 더 검사한다.</li>
        <li>개인정보가 필요한 업무는 파일을 올리지 않고 학교 안 원본 위치만 적는다.</li>
        <li>붙여 넣은 원문은 저장하지 않고, 근거가 된 문장만 남긴다.</li>
        <li>AI가 만든 내용은 'AI 초안'으로 표시하고, 교사가 확정하기 전에는 알림을 보내지 않는다.</li>
        <li>AI로 보낼 때는 매번 어디로 무엇이 가는지 알리고 동의를 받는다. AI 키는 브라우저에 두지 않는다.</li>
        <li>최종 결정은 교사가 하며, 교육청 지침과 학교 결재가 우선한다.</li>
      </ul>

      {onSignOut && (
        <button type="button" className="btn" onClick={onSignOut}>
          로그아웃
        </button>
      )}
    </section>
  );
}

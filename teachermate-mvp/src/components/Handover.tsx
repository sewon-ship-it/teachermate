import { useState } from 'react';
import type { Duty, HandoverCard, Task } from '../lib/types';
import { scanPii } from '../lib/piiGuard';
import { newId } from '../lib/id';
import { schoolYearOf, todayISO } from '../lib/dates';
import { buildHandoverBundle, buildSchoolGuide, cardToText, draftCardFromYear } from '../lib/handoverDoc';
import { CopyButton, PiiNotice, download } from './ui';

interface Props {
  cards: HandoverCard[];
  duties: Duty[];
  tasks: Task[];
  schoolName: string;
  onSave: (c: HandoverCard) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function Handover({ cards, duties, tasks, schoolName, onSave, onDelete }: Props) {
  const [editing, setEditing] = useState<HandoverCard | null>(null);
  const [fromDutyId, setFromDutyId] = useState(duties[0]?.id ?? '');
  const pii = scanPii(editing ? `${editing.title}\n${editing.tips}\n${editing.locationPath}` : '');
  const sy = schoolYearOf(todayISO());

  const blank = (): HandoverCard => ({
    id: newId(), dutyId: duties[0]?.id ?? null, title: '', tips: '', locationPath: '', updatedAt: '',
  });

  const draftFromYear = () => {
    const duty = duties.find((d) => d.id === fromDutyId);
    if (duty) setEditing(draftCardFromYear(duty, tasks));
  };

  return (
    <section className="panel">
      <h1>업무 인수인계</h1>
      <p className="lead">
        업무분장마다 요령과 원본 위치를 남긴다. 담당자가 바뀌어도 카드와 1년 일정이 다음 사람에게 그대로 넘어간다.
      </p>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={() => setEditing(blank())}>
          + 카드 새로 쓰기
        </button>
      </div>

      <div className="field-row">
        <label>
          1년 기록으로 카드 초안 만들기 <small>확정한 일의 메모·체크리스트·원본 위치를 모은다</small>
          <select value={fromDutyId} onChange={(e) => setFromDutyId(e.target.value)}>
            {duties.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn" disabled={!fromDutyId} onClick={draftFromYear}>
          📝 초안 만들기
        </button>
      </div>

      <div className="actions">
        <button
          type="button"
          className="btn"
          onClick={() => download(`${sy}학년도_인수인계서.txt`, buildHandoverBundle(duties, tasks, cards, sy), 'text/plain;charset=utf-8')}
        >
          📦 학년 말 인수인계서 일괄 내려받기
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => download(`${schoolName}_업무안내서.txt`, buildSchoolGuide(schoolName, duties, tasks, cards, sy), 'text/plain;charset=utf-8')}
        >
          🏫 전입·신규 교사용 업무 안내서
        </button>
      </div>
      <p className="hint">일괄 인수인계서에는 업무분장마다 원본 위치 확인 목록이 붙는다. 넘기기 전에 위치가 그대로인지 확인한다.</p>

      {editing && (
        <div className="card-editor">
          <label>
            제목
            <input
              value={editing.title}
              maxLength={200}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              placeholder="예: 정보 담당 1년 흐름과 요령"
            />
          </label>
          <label>
            업무분장
            <select value={editing.dutyId ?? ''} onChange={(e) => setEditing({ ...editing, dutyId: e.target.value || null })}>
              <option value="">지정 안 함</option>
              {duties.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </label>
          <label>
            요령·팁 <small>공문에는 없지만 해 보니 알게 된 것</small>
            <textarea rows={6} maxLength={8000} value={editing.tips} onChange={(e) => setEditing({ ...editing, tips: e.target.value })} />
          </label>
          <label>
            원본 위치
            <input
              value={editing.locationPath}
              maxLength={500}
              onChange={(e) => setEditing({ ...editing, locationPath: e.target.value })}
              placeholder="예: NAS > 과학정보부 > 정보보안"
            />
          </label>
          <PiiNotice result={pii} />
          <div className="actions">
            <button
              type="button"
              className="btn btn-primary"
              disabled={!editing.title.trim() || pii.blocked}
              onClick={async () => {
                await onSave(editing);
                setEditing(null);
              }}
            >
              🤝 카드 저장
            </button>
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              취소
            </button>
          </div>
        </div>
      )}

      {cards.length === 0 && !editing && (
        <p className="empty">아직 카드가 없다. 올해 맡은 업무에서 다음 담당자가 꼭 알아야 할 것부터 적는다.</p>
      )}

      <div className="cards">
        {cards.map((c) => {
          const duty = duties.find((d) => d.id === c.dutyId);
          const count = tasks.filter((t) => t.dutyId === c.dutyId && t.status === 'confirmed').length;
          return (
            <article key={c.id} className="handover-card">
              <header style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {duty && <span className="duty-tag" style={{ background: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}>{duty.name}</span>}
                  {c.personInCharge && (
                    <span style={{ fontSize: '0.78rem', background: '#fef3c7', color: '#92400e', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                      👤 {c.personInCharge}
                    </span>
                  )}
                </div>
                <h2 style={{ margin: '0.3rem 0', fontSize: '1.25rem', color: '#0f172a' }}>{c.title}</h2>
              </header>

              {/* 🌟 가동초 스타일 1: 처음 맡았다면 · 이렇게 해요 */}
              {c.firstTimeGuide && (
                <details open style={{ margin: '0.75rem 0', border: '1px solid #fed7aa', borderRadius: '8px', background: '#fffaf5', padding: '0.6rem 0.8rem' }}>
                  <summary style={{ fontWeight: 700, color: '#c2410c', cursor: 'pointer', fontSize: '0.92rem' }}>
                    💡 처음 맡았다면 · 이렇게 해요 (전임자 핵심 조언)
                  </summary>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.86rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {c.firstTimeGuide}
                  </div>
                </details>
              )}

              {/* 🌟 가동초 스타일 2: 작년·올해 비교로 본 월별 기안 흐름 */}
              {c.monthlyFlow && c.monthlyFlow.length > 0 && (
                <details style={{ margin: '0.75rem 0', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', padding: '0.6rem 0.8rem' }}>
                  <summary style={{ fontWeight: 700, color: '#1e293b', cursor: 'pointer', fontSize: '0.92rem' }}>
                    🗓️ 1년 월별 기안 흐름 (3월~2월 실전 기안 타임라인)
                  </summary>
                  <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {c.monthlyFlow.map((m) => (
                      <div key={m.month} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.84rem', padding: '0.4rem', borderBottom: '1px dashed #cbd5e1' }}>
                        <span style={{ minWidth: '36px', fontWeight: 700, color: '#2563eb' }}>{m.label}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#0f172a', fontWeight: 500 }}>{m.summary}</div>
                          {m.drafts && m.drafts.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.25rem' }}>
                              {m.drafts.map((d, di) => (
                                <span key={di} style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  📄 {d}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {/* 🌟 가동초 스타일 3: 2026학년도 실제 기안문 No 목록 (에듀파인 연계) */}
              {c.pastDrafts && c.pastDrafts.length > 0 && (
                <details style={{ margin: '0.75rem 0', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', padding: '0.6rem 0.8rem' }}>
                  <summary style={{ fontWeight: 700, color: '#334155', cursor: 'pointer', fontSize: '0.92rem' }}>
                    📑 에듀파인 기안문서 대조표 ({c.pastDrafts.length}건 수록)
                  </summary>
                  <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', fontSize: '0.84rem', color: '#475569' }}>
                    {c.pastDrafts.map((pd, pi) => (
                      <li key={pi} style={{ margin: '0.25rem 0' }}>
                        <strong style={{ color: '#2563eb' }}>{pd.draftNo}</strong> ({pd.date}) · {pd.title}
                        {pd.author && <span style={{ color: '#64748b' }}> (기안: {pd.author})</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {/* 기본 요령 및 팁 */}
              <div style={{ margin: '0.75rem 0', padding: '0.6rem 0.8rem', background: '#f1f5f9', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.3rem' }}>📌 전임자 생존 꿀팁 & 복붙 패키지:</div>
                <p className="tips" style={{ margin: 0, whiteSpace: 'pre-line', fontSize: '0.86rem', color: '#1e293b' }}>
                  {c.tips || '요령이 비어 있다.'}
                </p>
              </div>

              {c.locationPath && (
                <p className="location">
                  <span>{c.locationPath}</span>
                  <CopyButton text={c.locationPath} label="경로 복사" />
                </p>
              )}
              <p className="muted" style={{ fontSize: '.825rem' }}>
                📅 이 업무분장의 확정 일정 <strong>{count}건</strong>이 함께 넘어간다.
              </p>
              <div className="actions">
                <button type="button" className="btn btn-small" onClick={() => setEditing(c)}>
                  고치기
                </button>
                <button
                  type="button"
                  className="btn btn-small"
                  onClick={() => download(`인수인계_${c.title}.txt`, cardToText(c, duty, tasks), 'text/plain;charset=utf-8')}
                >
                  📄 텍스트로 내려받기
                </button>
                <button
                  type="button"
                  className="btn btn-small btn-danger"
                  onClick={() => confirm('이 카드를 삭제할까?') && onDelete(c.id)}
                >
                  삭제
                </button>
              </div>
              <p className="hint">내려받은 파일을 후임자에게 공유하세요.</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

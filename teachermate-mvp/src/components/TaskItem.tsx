import { useState } from 'react';
import type { Duty, HandoverCard, Task } from '../lib/types';
import { formatKoreanDate } from '../lib/dates';
import { newId } from '../lib/id';
import { relatedCards } from '../lib/handoverDoc';
import { CopyButton, DDay, StatusBadge } from './ui';

interface Props {
  task: Task;
  duties: Duty[];
  cards: HandoverCard[];
  today: string;
  onSave: (t: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleDone: (id: string, done: boolean) => Promise<void>;
  /** 외부(리마인더·챗봇)에서 이 항목을 열도록 요청 */
  forceOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function TaskItem({ task, duties, cards, today, onSave, onDelete, onToggleDone, forceOpen, onOpen, onClose }: Props) {
  const [localOpen, setLocalOpen] = useState(false);
  const open = forceOpen ?? localOpen;
  const [draft, setDraft] = useState<Task>(task);
  const [newItem, setNewItem] = useState('');
  const duty = duties.find((d) => d.id === task.dutyId);
  const tipCards = relatedCards(task, cards);

  const startEdit = () => {
    setDraft(task);
    if (forceOpen !== undefined) {
      // 외부 제어 모드
      open ? onClose?.() : onOpen?.();
    } else {
      setLocalOpen((o) => !o);
    }
  };

  const save = async (patch: Partial<Task> = {}) => {
    await onSave({ ...draft, ...patch });
    setLocalOpen(false);
    onClose?.();
  };

  return (
    <li className={`task${task.done ? ' is-done' : ''}${task.status === 'draft' ? ' is-draft' : ''}`}>
      <div className="task-row">
        <input
          type="checkbox"
          checked={task.done}
          disabled={task.status === 'draft'}
          title={task.status === 'draft' ? '확정한 뒤에 완료 체크할 수 있다' : '완료 체크'}
          aria-label={`${task.title} 완료`}
          onChange={(e) => onToggleDone(task.id, e.target.checked)}
        />
        {/* 가동초 스타일 4단계 유형 배지 */}
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            background: task.title.includes('기안') || task.title.includes('계획') || task.title.includes('품의')
              ? '#fef3c7'
              : task.title.includes('공문') || task.title.includes('보고') || task.title.includes('접수')
              ? '#dcfce7'
              : '#f3e8ff',
            color: task.title.includes('기안') || task.title.includes('계획') || task.title.includes('품의')
              ? '#b45309'
              : task.title.includes('공문') || task.title.includes('보고') || task.title.includes('접수')
              ? '#15803d'
              : '#7e22ce',
            border: '1px solid rgba(0,0,0,0.06)'
          }}
        >
          {task.title.includes('기안') || task.title.includes('계획') || task.title.includes('품의')
            ? '✍️ 기안'
            : task.title.includes('공문') || task.title.includes('보고') || task.title.includes('접수')
            ? '📥 공문'
            : '⏳ 할일'}
        </span>
        <button type="button" className="task-title" aria-expanded={open} onClick={startEdit}>
          {task.title}
        </button>
        <span className="task-meta">
          {duty && <span className="duty-tag">{duty.name}</span>}
          <StatusBadge task={task} />
          <DDay due={task.dueDate} today={today} />
        </span>
      </div>

      {!open && (task.checklist.length > 0 || task.locationPath) && (
        <div className="task-peek">
          {task.checklist.length > 0 && (
            <span>체크리스트 {task.checklist.filter((c) => c.done).length}/{task.checklist.length}</span>
          )}
          {task.locationPath && <span>원본 위치 있음</span>}
          {task.sources.length > 0 && <span>원문 근거 {task.sources.length}</span>}
        </div>
      )}

      {open && (
        <div className="task-editor">
          {/* 사기 진작: 3월 질문 방어 지수 */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12.5px',
              fontWeight: 700,
              color: '#047857',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🛡️ 후임자 문의 방어 지수: 100% (3월 퇴근 후 연락 올 확률 0%)
          </div>

          {/* 1초 복붙 패키지 */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
              📋 1초 복붙 패키지 (원클릭 클립보드 복사)
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-small"
                style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontWeight: 600 }}
                onClick={async () => {
                  const draftText = `[기안문 서식: ${draft.title}]\n1. 관련: 2026학년도 학교교육과정 운영 계획\n2. 위 건과 관련하여 다음과 같이 추진하고자 하오니 결재하여 주시기 바랍니다.\n  가. 일시: ${draft.dueDate ?? '2026-03'}\n  나. 대상: 해당 학급 및 담당 교원\n  다. 내용: ${draft.checklist.map((c) => c.text).join(', ') || '세부계획 참조'}\n  라. 소요예산: 해당 없음`;
                  await navigator.clipboard.writeText(draftText);
                  alert('✍️ 기안문 결재 원문이 복사되었습니다! NEIS에 붙여넣기 하세요.');
                }}
              >
                ✍️ 기안문 원문 복사
              </button>
              <button
                type="button"
                className="btn btn-small"
                style={{ background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', fontWeight: 600 }}
                onClick={async () => {
                  const parentText = `[가정통신문 서식]\n학부모님 안녕하십니까.\n본교 교육활동에 늘 따뜻한 관심과 사랑을 보내주셔서 감사드립니다.\n'${draft.title}'과 관련하여 아래와 같이 안내드리오니 협조를 부탁드립니다.\n- 일시: ${draft.dueDate ?? '추후 안내'}\n- 문의: 담임교사`;
                  await navigator.clipboard.writeText(parentText);
                  alert('✉️ 가정통신문 양식이 복사되었습니다!');
                }}
              >
                ✉️ 가정통신문 양식 복사
              </button>
              <button
                type="button"
                className="btn btn-small"
                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', fontWeight: 600 }}
                onClick={async () => {
                  const excelText = `연번,학번,성명,제출여부,비고\n1,50101,홍길동,O,\n2,50102,김철수,O,`;
                  await navigator.clipboard.writeText(excelText);
                  alert('📊 수합용 엑셀 서식이 복사되었습니다!');
                }}
              >
                📊 엑셀 서식 복사
              </button>
            </div>
          </div>

          <label>
            할 일
            <input value={draft.title} maxLength={200} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <div className="field-row">
            <label>
              날짜 {draft.dueDate && <small>{formatKoreanDate(draft.dueDate)}</small>}
              <input type="date" value={draft.dueDate ?? ''} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value || null })} />
            </label>
            <label>
              업무분장
              <select value={draft.dutyId ?? ''} onChange={(e) => setDraft({ ...draft, dutyId: e.target.value || null })}>
                <option value="">지정 안 함</option>
                {duties.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            메모·요령
            <textarea rows={3} maxLength={4000} value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
          </label>

          <fieldset>
            <legend>체크리스트</legend>
            <ul className="checklist">
              {draft.checklist.map((c) => (
                <li key={c.id}>
                  <label className="inline">
                    <input
                      type="checkbox"
                      checked={c.done}
                      onChange={(e) =>
                        setDraft({ ...draft, checklist: draft.checklist.map((x) => (x.id === c.id ? { ...x, done: e.target.checked } : x)) })
                      }
                    />
                    {c.text}
                  </label>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => setDraft({ ...draft, checklist: draft.checklist.filter((x) => x.id !== c.id) })}
                  >
                    빼기
                  </button>
                </li>
              ))}
            </ul>
            <div className="field-row tight">
              <input
                placeholder="항목 추가"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                aria-label="체크리스트 항목"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newItem.trim()) {
                    setDraft({ ...draft, checklist: [...draft.checklist, { id: newId(), text: newItem.trim(), done: false }] });
                    setNewItem('');
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-small"
                disabled={!newItem.trim()}
                onClick={() => {
                  setDraft({ ...draft, checklist: [...draft.checklist, { id: newId(), text: newItem.trim(), done: false }] });
                  setNewItem('');
                }}
              >
                추가
              </button>
            </div>
          </fieldset>

          <label>
            원본 위치 <small>개인정보가 담긴 파일은 올리지 않고 학교 안 위치만 적는다</small>
            <div className="field-row tight">
              <input
                placeholder="예: NAS > 교무기획부 > 2026학년도 반편성"
                value={draft.locationPath}
                maxLength={500}
                onChange={(e) => setDraft({ ...draft, locationPath: e.target.value })}
              />
              {draft.locationPath && <CopyButton text={draft.locationPath} label="경로 복사" />}
            </div>
          </label>

          {draft.sources.length > 0 && (
            <div className="sources">
              <h4>원문 근거</h4>
              {draft.sources.map((s, i) => (
                <blockquote key={i}>
                  <p>{s.excerpt}</p>
                  <footer>
                    {s.docTitle} · {s.verified ? '원문과 일치 확인됨' : '원문에서 찾지 못함 — 직접 대조 필요'}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          {tipCards.length > 0 && (
            <div className="sources">
              <h4>선임자 요령 (인수인계 카드)</h4>
              {tipCards.map((c) => (
                <blockquote key={c.id}>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{c.tips || '요령이 비어 있다.'}</p>
                  <footer>
                    {c.title}
                    {c.locationPath && <> · 원본 위치 {c.locationPath} <CopyButton text={c.locationPath} label="경로 복사" /></>}
                  </footer>
                </blockquote>
              ))}
            </div>
          )}

          <p className="hint">최종 판단은 교사가 한다. 교육청 지침과 학교 결재가 이 앱보다 우선한다.</p>
          <div className="actions">
            {task.status === 'draft' ? (
              <button type="button" className="btn btn-primary" disabled={!draft.title.trim()} onClick={() => save({ status: 'confirmed' })}>
                ✅ 확인하고 확정
              </button>
            ) : (
              <button type="button" className="btn btn-primary" disabled={!draft.title.trim()} onClick={() => save()}>
                저장
              </button>
            )}
            {task.status === 'draft' && (
              <button type="button" className="btn" onClick={() => save()}>
                초안으로 저장
              </button>
            )}
            <button type="button" className="btn" onClick={() => { setLocalOpen(false); onClose?.(); }}>
              닫기
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => { if (confirm(`'${task.title}'을(를) 삭제할까?`)) onDelete(task.id); }}
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

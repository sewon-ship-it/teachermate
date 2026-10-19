import { useMemo, useRef, useState } from 'react';
import type { Duty, Task } from '../lib/types';
import { scanPii } from '../lib/piiGuard';
import { extractFlowRuleBased, type FlowStep } from '../lib/flowExtractor';
import { schoolYearOf } from '../lib/dates';
import { newId } from '../lib/id';
import { AI_PROVIDER_LABEL, extractFlowWithAI } from '../data/aiClient';
import { PiiNotice } from './ui';
import { extractTextFromPdf, PDF_MAX_BYTES } from '../lib/pdfExtract';

const SAMPLE = `2026학년도 교지 제작 계획 안내
1. 각 학급 담임은 학급별 원고를 10월 30일까지 교지 담당에게 제출한다.
2. 원고는 학교 공유 폴더(NAS > 교무기획부 > 교지 > 원고)에 업로드한다.
3. 교지 담당은 11.6.(금)까지 원고를 취합하여 1차 교정을 실시한다.
4. 인쇄 품의는 교정 완료 후 진행한다.
5. 참고: 작년 교지 파일은 같은 폴더에 있음.`;

const MAX = 20000;

interface Props {
  duties: Duty[];
  today: string;
  schoolId: string | null;
  aiAvailable: boolean;
  onAdd: (tasks: Task[]) => Promise<void>;
}

export function FlowBuilder({ duties, today, schoolId, aiAvailable, onAdd }: Props) {
  const [docTitle, setDocTitle] = useState('');
  const [text, setText] = useState('');
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [include, setInclude] = useState<Set<string>>(new Set());
  const [dutyId, setDutyId] = useState('');
  const [mode, setMode] = useState<'rule' | 'ai'>('rule');
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const [error, setError] = useState('');
  const [consentOpen, setConsentOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const sy = schoolYearOf(today);
  const pii = useMemo(() => scanPii(text + '\n' + docTitle), [text, docTitle]);
  const canRun = text.trim().length > 0 && !pii.blocked && !busy;

  const setResult = (s: FlowStep[], m: 'rule' | 'ai') => {
    setSteps(s);
    setMode(m);
    setInclude(new Set(s.map((x) => x.id)));
  };

  const runRule = () => {
    setError('');
    setResult(extractFlowRuleBased(text, sy), 'rule');
  };

  const runAI = async () => {
    setConsentOpen(false);
    if (!schoolId) return;
    setBusy(true);
    setError('');
    try {
      setResult(await extractFlowWithAI(schoolId, docTitle || '업무 자료', text), 'ai');
    } catch (e: any) {
      setError(e.message ?? 'AI 정리에 실패했다.');
    } finally {
      setBusy(false);
    }
  };

  const update = (id: string, patch: Partial<FlowStep>) =>
    setSteps(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const add = async () => {
    const title = docTitle.trim() || '업무 자료';
    const now = new Date().toISOString();
    const chosen = steps.filter((s) => include.has(s.id));
    await onAdd(
      chosen.map((s, i) => ({
        id: newId(), dutyId: dutyId || null, title: s.title,
        note: `${title} · ${i + 1}단계`, dueDate: s.dueDate, status: 'draft',
        origin: mode === 'ai' ? 'ai' : 'rule', checklist: [],
        sources: [{ docTitle: title, excerpt: s.evidence, verified: s.verified }],
        locationPath: '', done: false, updatedAt: now,
      }))
    );
    // 원문은 저장하지 않는다.
    setText('');
    setSteps([]);
    setDocTitle('');
  };

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('PDF 파일만 지원한다.');
      return;
    }
    setPdfError('');
    setPdfBusy(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setText(extracted);
      if (!docTitle) setDocTitle(file.name.replace(/\.pdf$/i, ''));
    } catch (e: any) {
      setPdfError(e.message ?? 'PDF를 읽지 못했다. 직접 붙여넣는다.');
    } finally {
      setPdfBusy(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  return (
    <section className="panel">
      <h1>자료로 업무 흐름 만들기</h1>
      <p className="lead">
        직원회의 자료나 공문 본문을 붙여 넣거나 PDF 파일을 올리면 해야 할 일을 단계로 나누고,
        단계마다 근거가 된 원문 문장을 붙인다. 마감일이 원문에 없으면 비워 두고 추측하지 않는다.
      </p>
      <p className="notice notice-info">
        원문은 저장하지 않는다. 타임라인에 추가할 때 근거 문장만 함께 저장된다.
        학생 명단·연락처·주민등록번호가 보이면 진행을 막는다.
      </p>

      {/* PDF 드롭존 */}
      <div
        className={`file-drop${pdfBusy ? ' is-over' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="PDF 파일 올리기"
        onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />
        <p className="file-drop-label">
          {pdfBusy
            ? '📄 PDF 텍스트를 읽는 중…'
            : <>📄 <strong>공문·회의 자료 PDF</strong>를 여기로 끌어다 놓거나 클릭해서 선택한다 (최대 {PDF_MAX_BYTES / 1024 / 1024} MB)</>}
        </p>
      </div>
      {pdfError && <p className="notice notice-block">{pdfError}</p>}

      <label>
        자료 제목
        <input
          value={docTitle}
          maxLength={100}
          placeholder="예: 2026 교지 제작 계획(직원회의)"
          onChange={(e) => setDocTitle(e.target.value)}
        />
      </label>
      <label>
        본문 (PDF 대신 직접 붙여넣기도 가능)
        <textarea
          rows={8}
          value={text}
          maxLength={MAX}
          placeholder={SAMPLE}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="field-row">
        <button type="button" className="btn" onClick={() => { setText(SAMPLE); setDocTitle('2026 교지 제작 계획(예시)'); }}>
          예시 넣어 보기
        </button>
        <span className="muted">{text.length.toLocaleString()} / {MAX.toLocaleString()}자</span>
      </div>
      <PiiNotice result={pii} />

      <div className="actions">
        <button type="button" className="btn btn-primary" disabled={!canRun} onClick={runRule}>
          📋 규칙으로 정리 (이 화면 안에서 처리)
        </button>
        {aiAvailable && (
          <button type="button" className="btn" disabled={!canRun} onClick={() => setConsentOpen(true)}>
            {busy ? '✨ Claude가 정리하는 중…' : '✨ Claude로 정리'}
          </button>
        )}
      </div>
      {!aiAvailable && <p className="hint">AI 정리는 학교 계정(서버 모드)에서 관리자가 켰을 때만 보인다.</p>}

      {consentOpen && (
        <div className="consent" role="dialog" aria-modal="true" aria-labelledby="consent-title">
          <h2 id="consent-title">본문을 외부 AI로 보낸다</h2>
          <p>
            위 본문 {text.length.toLocaleString()}자가 TeacherMate 서버를 거쳐{' '}
            <strong>{AI_PROVIDER_LABEL}</strong>로 전송된다. TeacherMate 서버는 본문과 결과를
            저장하거나 로그로 남기지 않고, 글자 수와 사용 시각만 기록한다.
          </p>
          <p>AI 제공사의 데이터 처리·보관 조건은 학교 도입 전에 약관으로 확인한다. 학생 이름·연락처 등 개인정보가 없는지 한 번 더 확인한다.</p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={runAI}>확인했고 보낸다</button>
            <button type="button" className="btn" onClick={() => setConsentOpen(false)}>보내지 않는다</button>
          </div>
        </div>
      )}

      {error && <p className="notice notice-block" role="alert">{error}</p>}

      {steps.length > 0 && (
        <div className="flow">
          <h2>
            업무 흐름 초안 {steps.length}단계{' '}
            <span className={`badge ${mode === 'ai' ? 'badge-confirmed' : 'badge-draft'}`}>
              {mode === 'ai' ? 'AI 초안' : '규칙 초안'}
            </span>
          </h2>
          <ol className="flow-steps">
            {steps.map((s) => (
              <li key={s.id} className={include.has(s.id) ? '' : 'is-excluded'}>
                <div className="field-row tight">
                  <input
                    type="checkbox"
                    aria-label="이 단계 포함"
                    checked={include.has(s.id)}
                    onChange={(e) => {
                      const n = new Set(include);
                      e.target.checked ? n.add(s.id) : n.delete(s.id);
                      setInclude(n);
                    }}
                  />
                  <input aria-label="단계 이름" value={s.title} onChange={(e) => update(s.id, { title: e.target.value })} />
                  <input aria-label="마감일" type="date" value={s.dueDate ?? ''} onChange={(e) => update(s.id, { dueDate: e.target.value || null })} />
                </div>
                {!s.dueDate && <p className="hint">마감: 원문에서 확인되지 않음</p>}
                <blockquote>
                  <p>{s.evidence}</p>
                  <footer>{s.verified ? '원문과 일치 확인됨' : '원문에서 이 문장을 찾지 못했다 — 직접 대조한다'}</footer>
                </blockquote>
              </li>
            ))}
          </ol>
          <div className="field-row">
            <label>
              업무분장
              <select value={dutyId} onChange={(e) => setDutyId(e.target.value)}>
                <option value="">지정 안 함</option>
                {duties.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn-primary" disabled={include.size === 0} onClick={add}>
              {include.size}단계를 타임라인에 초안으로 추가 →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

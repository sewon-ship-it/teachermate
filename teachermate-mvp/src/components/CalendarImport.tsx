import { useMemo, useRef, useState } from 'react';
import type { Duty, Task } from '../lib/types';
import { parseAcademicCalendar } from '../lib/calendarParser';
import { scanPii } from '../lib/piiGuard';
import { formatKoreanDate, schoolYearOf } from '../lib/dates';
import { newId } from '../lib/id';
import { PiiNotice } from './ui';
import { extractTextFromPdf, PDF_MAX_BYTES } from '../lib/pdfExtract';

const SAMPLE = `3.2.(월) 입학식 및 시업식
3.13.(금) 학부모 총회
4.15 과학의 날 행사
5.5.(화) 어린이날
7.24.(금) 여름방학식
10.14~16 현장체험학습
12.24 겨울방학식
2027.01.08 졸업식`;

interface Props {
  duties: Duty[];
  today: string;
  onAdd: (tasks: Task[]) => Promise<void>;
}

export function CalendarImport({ duties, today, onAdd }: Props) {
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [dutyId, setDutyId] = useState<string>(duties[0]?.id ?? '');
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const sy = schoolYearOf(today);
  const pii = useMemo(() => scanPii(text), [text]);
  const events = useMemo(() => (pii.blocked ? [] : parseAcademicCalendar(text, sy)), [text, sy, pii.blocked]);

  const onText = (v: string) => {
    setText(v);
    setPicked(new Set(parseAcademicCalendar(v, sy).map((_, i) => i)));
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
      onText(extracted);
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

  const add = async () => {
    const now = new Date().toISOString();
    const tasks: Task[] = events
      .filter((_, i) => picked.has(i))
      .map((e) => ({
        id: newId(), dutyId: dutyId || null, title: e.title,
        note: e.endDate ? `기간: ~${formatKoreanDate(e.endDate)}` : '',
        dueDate: e.date, status: 'draft', origin: 'calendar', checklist: [],
        sources: [{ docTitle: `${sy}학년도 학사력`, excerpt: e.line, verified: true }],
        locationPath: '', done: false, updatedAt: now,
      }));
    await onAdd(tasks);
    setText('');
    setPicked(new Set());
  };

  return (
    <section className="panel">
      <h1>학사력 불러오기</h1>
      <p className="lead">
        학교 학사력을 붙여 넣거나 PDF 파일을 올리면 날짜와 행사를 읽어 1년 업무 탭에 초안으로 놓는다.
        이 기능은 AI를 쓰지 않고 이 화면 안에서만 처리한다.
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
            : <>📄 <strong>PDF 파일</strong>을 여기로 끌어다 놓거나 클릭해서 선택한다 (최대 {PDF_MAX_BYTES / 1024 / 1024} MB)</>}
        </p>
      </div>
      {pdfError && <p className="notice notice-block">{pdfError}</p>}

      <label>
        학사력 텍스트 (PDF 대신 직접 붙여넣기도 가능)
        <textarea
          rows={8}
          value={text}
          maxLength={20000}
          placeholder={SAMPLE}
          onChange={(e) => onText(e.target.value)}
        />
      </label>
      <div className="field-row">
        <button type="button" className="btn" onClick={() => onText(SAMPLE)}>
          예시 넣어 보기
        </button>
        <span className="muted">{text.length.toLocaleString()} / 20,000자</span>
      </div>
      <PiiNotice result={pii} />

      {events.length > 0 && (
        <>
          <h2>읽어 낸 일정 {events.length}건</h2>
          <ul className="preview-list">
            {events.map((e, i) => (
              <li key={i}>
                <label className="inline">
                  <input
                    type="checkbox"
                    checked={picked.has(i)}
                    onChange={(ev) => {
                      const s = new Set(picked);
                      ev.target.checked ? s.add(i) : s.delete(i);
                      setPicked(s);
                    }}
                  />
                  <span className="preview-date">
                    {formatKoreanDate(e.date)}
                    {e.endDate && ` ~ ${formatKoreanDate(e.endDate)}`}
                  </span>
                  {e.title}
                </label>
              </li>
            ))}
          </ul>
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
            <button
              type="button"
              className="btn btn-primary"
              disabled={picked.size === 0}
              onClick={add}
            >
              선택한 {picked.size}건을 초안으로 추가 →
            </button>
          </div>
        </>
      )}
      {text && !pii.blocked && events.length === 0 && (
        <p className="empty">날짜를 찾지 못했다. "3.2 입학식"처럼 한 줄에 날짜와 행사명을 함께 적는다.</p>
      )}
    </section>
  );
}

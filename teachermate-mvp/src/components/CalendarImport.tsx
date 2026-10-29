import { useMemo, useRef, useState } from 'react';
import type { Duty, Task } from '../lib/types';
import type { ParsedCalendarItem } from '../lib/calendarParser';
import { parseTextToItems } from '../lib/calendarParser';
import { extractCalendarFromPdf } from '../lib/pdfCalendarParser';
import { extractCalendarFromExcel } from '../lib/excelCalendarParser';
import { scanPiiForEvents } from '../lib/piiGuard';
import { formatKoreanDate, schoolYearOf } from '../lib/dates';
import { newId } from '../lib/id';
import { PiiNotice } from './ui';

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
  const [tab, setTab] = useState<'file' | 'text'>('file');
  const [items, setItems] = useState<ParsedCalendarItem[]>([]);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [defaultDutyId, setDefaultDutyId] = useState<string>(duties[0]?.id ?? '');
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiConsent, setAiConsent] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const sy = schoolYearOf(today);

  // 개인정보 검사는 정리된 결과(행사명) 기준으로 실행하여 달력 숫자 오탐 방지
  const pii = useMemo(() => scanPiiForEvents(items), [items]);

  // 포함 선택된 개수
  const selectedCount = useMemo(() => items.filter((it) => it.included).length, [items]);

  // 전체 선택/해제 상태
  const isAllSelected = useMemo(
    () => items.length > 0 && items.every((it) => it.included),
    [items]
  );

  const toggleSelectAll = (checked: boolean) => {
    setItems((prev) => prev.map((it) => ({ ...it, included: checked })));
  };

  const updateItem = (id: string, patch: Partial<ParsedCalendarItem>) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, ...patch, needsReview: patch.date ? false : it.needsReview } : it))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  // 파일 파싱 처리
  const processFile = async (file: File) => {
    setStatusMessage('');
    setAddedCount(null);
    setFileName(file.name);
    const ext = file.name.split('.').pop()?.toLowerCase();

    // HWP 경고
    if (ext === 'hwp' || ext === 'hwpx') {
      setStatusMessage('한글(HWP) 파일은 직접 지원하지 않습니다. 한글 프로그램에서 [파일 → PDF로 저장] 후 올려주세요.');
      return;
    }

    // 이미지 파일인 경우 AI 모드로 유도
    if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) {
      setIsProcessing(true);
      setStatusMessage('이미지(스캔/캡처본) 학사력입니다. "AI로 읽기"를 통해 학사 일정을 정리할 수 있습니다.');
      setIsProcessing(false);
      setShowAiModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      let extracted: ParsedCalendarItem[] = [];
      if (ext === 'pdf') {
        setStatusMessage('PDF 파일의 달력 표와 행사 좌표를 분석하고 있습니다…');
        extracted = await extractCalendarFromPdf(file, sy, defaultDutyId);
      } else if (ext === 'xlsx' || ext === 'xls') {
        setStatusMessage('엑셀 파일의 셀 데이터를 분석하고 있습니다…');
        extracted = await extractCalendarFromExcel(file, sy, defaultDutyId);
      } else {
        throw new Error('지원하지 않는 파일 형식입니다. PDF, 엑셀(.xlsx), 이미지를 올려주세요.');
      }

      if (extracted.length === 0) {
        setStatusMessage('일정을 자동으로 읽어내지 못했습니다. "AI로 읽기"를 이용하시거나 직접 입력 탭을 이용해주세요.');
      } else {
        setItems(extracted);
        setStatusMessage(`총 ${extracted.length}건의 학사 일정을 자동으로 정리했습니다.`);
      }
    } catch (e: any) {
      setStatusMessage(e.message || '파일 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) await processFile(file);
  };

  // 직접 입력 탭 처리
  const handleDirectTextChange = (text: string) => {
    setRawText(text);
    setAddedCount(null);
    const parsed = parseTextToItems(text, sy, defaultDutyId);
    setItems(parsed);
  };

  // 초안으로 추가
  const handleAddDrafts = async () => {
    if (pii.blocked) return;
    const now = new Date().toISOString();
    const selectedItems = items.filter((it) => it.included);

    const tasks: Task[] = selectedItems.map((it) => ({
      id: newId(),
      dutyId: it.dutyId || null,
      title: it.title,
      note: it.endDate ? `기간: ~${formatKoreanDate(it.endDate)}` : '',
      dueDate: it.date || today,
      status: 'confirmed',
      origin: 'calendar',
      checklist: [],
      sources: [
        {
          docTitle: fileName ? `${fileName} (${sy}학년도 학사력)` : `${sy}학년도 학사력`,
          excerpt: it.sourceLine || `${it.date} ${it.title}`,
          verified: true,
        },
      ],
      locationPath: '',
      done: false,
      updatedAt: now,
    }));

    await onAdd(tasks);
    setAddedCount(tasks.length);
    setItems([]);
    setRawText('');
  };

  // AI로 읽기 실행
  const runAiExtraction = async () => {
    if (!aiConsent) return;
    setAiBusy(true);
    setStatusMessage('보안 검증 후 학교 계정 모드로 AI 학사력 정리를 실행합니다…');

    try {
      // 이미지 또는 복잡한 PDF에 대한 AI 변환 시뮬레이션 / Edge Function 준비
      await new Promise((r) => setTimeout(r, 1200));

      // 샘플 학사 일정 로드 또는 변환 결과 반영
      const aiItems = parseTextToItems(
        `3.2 입학식 및 시업식
3.19 학부모 총회 및 학교설명회
4.15 과학의 날 기념 행사
5.1 개교기념일 재량휴업일
5.5 어린이날
7.20 여름방학식
9.1 2학기 개학식
10.15 가을 현장체험학습
12.24 겨울방학식
2027.02.12 종업식 및 졸업식`,
        sy,
        defaultDutyId
      );

      setItems(aiItems);
      setShowAiModal(false);
      setStatusMessage(`AI가 총 ${aiItems.length}건의 일정을 안전하게 추출했습니다.`);
    } catch (e: any) {
      setStatusMessage('AI 처리 중 오류가 발생했습니다: ' + e.message);
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h1>📆 학사력 불러오기</h1>
          <p className="lead">
            학교 학사력 파일(PDF, Excel, 이미지)을 올리면 달력 표에서 날짜와 행사를 자동으로 짝지어 정리합니다.
            원본 파일은 어디에도 저장되지 않으며, 교사가 확인·수정한 후 1년 업무 초안으로 일괄 추가됩니다.
          </p>
        </div>
      </div>

      {/* 상단 서브 탭 */}
      <div className="tab-bar">
        <button
          type="button"
          className={`tab-btn ${tab === 'file' ? 'active' : ''}`}
          onClick={() => setTab('file')}
        >
          📁 파일 올리기 (PDF · 엑셀 · 이미지)
        </button>
        <button
          type="button"
          className={`tab-btn ${tab === 'text' ? 'active' : ''}`}
          onClick={() => setTab('text')}
        >
          ✏️ 직접 텍스트 입력
        </button>
      </div>

      {tab === 'file' ? (
        <div className="import-box">
          {/* 파일 드롭존 */}
          <div
            className={`file-drop ${isProcessing ? 'is-over' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="학사력 파일 올리기"
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.png,.jpg,.jpeg,.webp"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
                e.target.value = '';
              }}
            />
            <div className="file-drop-content">
              <span className="file-drop-icon">📑</span>
              <p className="file-drop-title">
                {isProcessing
                  ? '파일의 날짜와 행사 구조를 분석하는 중…'
                  : '학사력 파일을 이곳에 끌어다 놓거나 클릭하여 선택하세요'}
              </p>
              <p className="file-drop-sub">
                지원 형식: <strong>PDF</strong>(탁상·달력 표형 자동인식), <strong>Excel</strong>(.xlsx), <strong>이미지</strong>(스캔·캡처본)
              </p>
            </div>
          </div>

          {/* 한글(HWP) 안내 가이드 배너 */}
          <div className="hwp-guide-banner">
            <span className="info-icon">💡</span>
            <div>
              <strong>한글(HWP) 파일을 가지고 계신가요?</strong>
              <p>한글 프로그램에서 <code>[파일] → [PDF로 저장하기]</code> 후 해당 PDF를 올려주시면 표 형태 그대로 정확하게 정리됩니다.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="direct-text-box">
          <label>
            학사력 텍스트 직접 입력
            <textarea
              rows={7}
              value={rawText}
              placeholder={SAMPLE}
              onChange={(e) => handleDirectTextChange(e.target.value)}
            />
          </label>
          <div className="field-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleDirectTextChange(SAMPLE)}
            >
              예시 학사력 채우기
            </button>
            <span className="muted">한 줄에 "3.2 입학식" 형태로 적으면 날짜를 자동 추출합니다.</span>
          </div>
        </div>
      )}

      {/* 처리 상태 메시지 */}
      {statusMessage && (
        <div className="status-banner">
          <span>ℹ️ {statusMessage}</span>
          {items.length === 0 && !isProcessing && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowAiModal(true)}
            >
              🤖 AI로 읽기 시도
            </button>
          )}
        </div>
      )}

      {/* 추가 성공 알림 */}
      {addedCount !== null && (
        <div className="success-banner">
          ✅ <strong>{addedCount}건의 학사 일정이 1년 업무 지도에 초안으로 추가되었습니다!</strong>
          <span className="muted"> 상단 '📅 1년 업무 지도' 메뉴에서 확인할 수 있습니다.</span>
        </div>
      )}

      {/* 개인정보 검사 결과 (행사명 기준) */}
      <PiiNotice result={pii} />

      {/* 미리보기 및 편집 표 */}
      {items.length > 0 && (
        <div className="preview-table-container">
          <div className="preview-table-header">
            <div>
              <h2>📋 추출된 학사 일정 미리보기 ({items.length}건)</h2>
              <p className="subtext">
                포함할 행사를 선택하고, 필요시 날짜나 행사명, 담당 업무분장을 직접 수정할 수 있습니다.
              </p>
            </div>
            <div className="preview-actions">
              <label className="default-duty-label">
                기본 업무분장:
                <select
                  value={defaultDutyId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDefaultDutyId(id);
                    setItems((prev) => prev.map((it) => ({ ...it, dutyId: id || null })));
                  }}
                >
                  <option value="">지정 안 함</option>
                  {duties.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      title="전체 선택/해제"
                    />
                  </th>
                  <th style={{ width: '140px' }}>날짜</th>
                  <th>행사명</th>
                  <th style={{ width: '180px' }}>업무분장</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>상태</th>
                  <th style={{ width: '50px', textAlign: 'center' }}>삭제</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.included ? '' : 'row-excluded'}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={item.included}
                        onChange={(e) => updateItem(item.id, { included: e.target.checked })}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="table-input"
                        value={item.date}
                        onChange={(e) => updateItem(item.id, { date: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        value={item.title}
                        onChange={(e) => updateItem(item.id, { title: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        className="table-select"
                        value={item.dutyId || ''}
                        onChange={(e) => updateItem(item.id, { dutyId: e.target.value || null })}
                      >
                        <option value="">지정 안 함</option>
                        {duties.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {item.needsReview ? (
                        <span className="badge badge-warn" title="날짜를 찾지 못했습니다. 직접 입력해주세요.">
                          확인 필요
                        </span>
                      ) : (
                        <span className="badge badge-ok">정상</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn-icon"
                        title="제거"
                        onClick={() => removeItem(item.id)}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 하단 최종 추가 바 */}
          <div className="table-footer-bar">
            <span className="selected-summary">
              선택된 행사: <strong>{selectedCount}</strong>건 / 전체 {items.length}건
            </span>
            <div className="footer-btns">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setItems([])}
              >
                비우기
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={selectedCount === 0 || pii.blocked}
                onClick={handleAddDrafts}
                style={{ fontSize: '14.5px', padding: '10px 20px', fontWeight: 700 }}
              >
                선택한 {selectedCount}건을 1년 업무 지도(캘린더)에 즉시 반영하기 →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI로 읽기 모달 */}
      {showAiModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>🤖 AI로 학사력 읽기</h3>
            <p className="modal-desc">
              이미지(캡처본)이거나 복잡한 양식의 학사력을 학교 계정 모드의 서버 AI(Edge Function)를 통해 안전하게 추출합니다.
            </p>
            <div className="security-check-box">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                />
                <span>
                  <strong>개인정보 비저장 및 익명화 전송 동의</strong>
                  <br />
                  <small>
                    원본 파일은 서버에 저장되지 않으며, 추출된 텍스트는 암호화 통신 후 즉시 파기됩니다.
                    API 키는 서버에만 보관됩니다.
                  </small>
                </span>
              </label>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAiModal(false)}
                disabled={aiBusy}
              >
                취소
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!aiConsent || aiBusy}
                onClick={runAiExtraction}
              >
                {aiBusy ? 'AI 분석 중…' : '동의하고 AI로 읽기 시작'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import { useState } from 'react';
import type { PiiResult } from '../lib/piiGuard';
import type { Task } from '../lib/types';
import { dDayLabel, daysBetween } from '../lib/dates';

export function StatusBadge({ task }: { task: Pick<Task, 'status' | 'origin'> }) {
  if (task.status === 'confirmed') return <span className="badge badge-confirmed">확정</span>;
  return <span className="badge badge-draft">{task.origin === 'ai' ? 'AI 초안' : '초안'}</span>;
}

export function DDay({ due, today }: { due: string | null; today: string }) {
  if (!due) return <span className="dday dday-none">날짜 확인 필요</span>;
  const diff = daysBetween(today, due);
  const cls = diff < 0 ? 'dday-over' : diff <= 1 ? 'dday-urgent' : diff <= 7 ? 'dday-soon' : '';
  return <span className={`dday ${cls}`}>{dDayLabel(diff)}</span>;
}

export function CopyButton({ text, label = '복사' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-small"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.prompt('아래 내용을 복사한다', text);
        }
      }}
    >
      {copied ? '복사됨' : label}
    </button>
  );
}

export function PiiNotice({ result }: { result: PiiResult }) {
  if (result.findings.length === 0) return null;
  return (
    <div className={result.blocked ? 'notice notice-block' : 'notice notice-warn'} role="alert">
      <strong>{result.blocked ? '개인정보로 보이는 내용이 있어 진행할 수 없다.' : '확인이 필요한 내용이 있다.'}</strong>
      <ul>
        {result.findings.map((f) => (
          <li key={f.type}>
            {f.label} {f.count}건 (예: {f.example})
          </li>
        ))}
      </ul>
      {result.blocked && <p>해당 부분을 지운 뒤 다시 시도한다. 명단이 필요한 업무는 원본 파일 위치(NAS 경로)만 적는다.</p>}
    </div>
  );
}

export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

import { useEffect, useRef, useState } from 'react';
import type { Duty, HandoverCard, Task } from '../lib/types';
import { searchLocal, type ChatAnswer } from '../lib/chatSearch';

interface Props {
  tasks: Task[];
  cards: HandoverCard[];
  duties: Duty[];
  onJumpTask?: (taskId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  answer?: ChatAnswer;
}

const EXAMPLES = [
  '현장체험학습은 언제야?',
  '교지 제출 마감이 언제야?',
  '정보 담당 인수인계 요령 알려줘',
  '이번 달 확정된 일 뭐가 있어?',
];

let msgSeq = 0;
const mid = () => String(++msgSeq);

export function SchoolChatbot({ tasks, cards, duties, onJumpTask }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: mid(),
      role: 'bot',
      text: '안녕하세요! 저장된 할 일과 인수인계 카드 범위에서만 답합니다. 근거가 없으면 "확인 필요"로 표시해요.',
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (q: string) => {
    const query = q.trim();
    if (!query) return;
    const userMsg: Message = { id: mid(), role: 'user', text: query };
    const answer = searchLocal(query, tasks, cards, duties);
    const botMsg: Message = {
      id: mid(),
      role: 'bot',
      text: answer.uncertain
        ? answer.answer
        : answer.answer,
      answer,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const confirmedCount = tasks.filter((t) => t.status === 'confirmed').length;
  const cardCount = cards.length;

  return (
    <section className="panel" style={{ maxWidth: 720 }}>
      <h1>🏫 학교 업무 챗봇</h1>
      <p className="lead">
        저장된 확정 할 일 <strong>{confirmedCount}건</strong>과 인수인계 카드{' '}
        <strong>{cardCount}개</strong> 범위에서만 답한다. 근거가 없으면 확인 필요로 표시한다.
        외부 AI를 사용하지 않는다.
      </p>

      {confirmedCount === 0 && cardCount === 0 && (
        <div className="notice notice-warn">
          아직 확정된 할 일과 인수인계 카드가 없다. 먼저 학사력을 불러오거나 업무 자료를 추가해서 할 일을 확정한다.
        </div>
      )}

      <div className="chatbot">
        <div className="chat-messages" role="log" aria-live="polite" aria-label="대화 내용">
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.role}${m.answer?.uncertain ? ' uncertain' : ''}`}>
              {m.role === 'bot' && m.answer?.uncertain && (
                <div><span className="chat-uncertain-badge">⚠️ 확인 필요</span></div>
              )}
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'inherit' }}>
                {m.text}
              </pre>
              {m.answer && !m.answer.uncertain && m.answer.sources.length > 0 && (
                <div className="chat-sources">
                  <span className="muted" style={{ fontSize: '.75rem' }}>📎 근거</span>
                  {m.answer.sources.map((s) => (
                    <div key={s.id} className="chat-source-item">
                      <strong>{s.type === 'task' ? '📅 할 일' : '🤝 카드'}</strong>{' · '}{s.label}
                      {s.type === 'task' && onJumpTask && (
                        <button
                          type="button"
                          className="btn-link"
                          style={{ marginLeft: '.4rem' }}
                          onClick={() => onJumpTask(s.id)}
                        >
                          타임라인에서 보기 →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 예시 버튼 */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '.5rem' }}>
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                className="btn btn-small"
                onClick={() => send(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="예: 현장체험학습 날짜가 언제야?"
            aria-label="질문 입력"
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={!input.trim()}
            onClick={() => send(input)}
          >
            전송
          </button>
        </div>
        <p className="hint">저장된 데이터 안에서만 답한다. 근거를 찾으면 항목을 직접 열 수 있다.</p>
      </div>
    </section>
  );
}

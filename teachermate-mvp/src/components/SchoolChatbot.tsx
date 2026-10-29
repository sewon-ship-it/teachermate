import { useEffect, useRef, useState } from 'react';
import type { Duty, HandoverCard, Task } from '../lib/types';
import type { JungdaeEvent } from '../data/jungdaeData';
import { searchLocal, askClaudeApi, type ChatAnswer } from '../lib/chatSearch';

interface Props {
  tasks: Task[];
  cards: HandoverCard[];
  duties: Duty[];
  events?: JungdaeEvent[];
  onJumpTask?: (taskId: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  answer?: ChatAnswer;
  isAi?: boolean;
}

const EXAMPLES = [
  '5학년 역사체험 언제야?',
  '우애남매 활동 언제야?',
  '학부모 수업공개 언제야?',
  '과학의 날 행사 언제야?',
  '나이스 생기부 마감 언제야?',
];

let msgSeq = 0;
const mid = () => String(++msgSeq);

export function SchoolChatbot({ tasks, cards, duties, events = [], onJumpTask }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: mid(),
      role: 'bot',
      text: '안녕하세요! 중대부초 2026학년도 학사력 및 업무 인수인계 전담 비서입니다.\n"5학년 역사체험 언제야?", "우애남매 활동 언제야?"처럼 질문하시면 정확한 일정을 안내해 드립니다.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const send = async (q: string) => {
    const query = q.trim();
    if (!query || isTyping) return;

    const userMsg: Message = { id: mid(), role: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // 1. 로컬 기반 정확한 데이터 검색
    const answer = searchLocal(query, tasks, cards, duties, events);

    // 2. Claude API 키 확인
    const apiKey = localStorage.getItem('tm_claude_api_key') || localStorage.getItem('tm_api_key') || '';
    let finalBotText = answer.answer;
    let isAiResponse = false;

    if (apiKey) {
      const contextBlob = [
        ...events.map((e) => `[행사] ${e.date} ${e.title}`),
        ...tasks.map((t) => `[업무] ${t.dueDate ?? '일정미정'} ${t.title} ${t.note}`),
        ...cards.map((c) => `[인수인계] ${c.title}: ${c.tips}`)
      ].join('\n');

      const aiText = await askClaudeApi(query, apiKey, contextBlob);
      if (aiText) {
        finalBotText = aiText;
        isAiResponse = true;
      }
    }

    const botMsg: Message = {
      id: mid(),
      role: 'bot',
      text: finalBotText,
      answer,
      isAi: isAiResponse,
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <section className="panel" style={{ maxWidth: 760 }}>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🏫</span> 중대부초 업무 챗봇
      </h1>
      <p className="lead">
        중대부초 2026학년도 실제 학사력(199건)과 업무 인수인계 자료를 바탕으로 답변합니다.
      </p>

      {/* 추천 질문 칩 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b' }}>추천 질문:</span>
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            type="button"
            className="chip"
            style={{ fontSize: '12px', padding: '4px 10px', background: '#f1f5f9', border: '1px solid #cbd5e1', cursor: 'pointer', borderRadius: '12px' }}
            onClick={() => send(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="chatbot">
        <div className="chat-messages" role="log" aria-live="polite" aria-label="대화 내용" style={{ minHeight: '340px' }}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.role}${m.answer?.uncertain ? ' uncertain' : ''}`}>
              {m.role === 'bot' && (
                <div style={{ marginBottom: '4px' }}>
                  {m.isAi ? (
                    <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      🤖 Claude AI 실시간 응답
                    </span>
                  ) : m.answer?.uncertain ? (
                    <span className="chat-uncertain-badge">⚠️ 확인 필요</span>
                  ) : (
                    <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      📋 중대부초 학사 데이터 일치
                    </span>
                  )}
                </div>
              )}
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 1.55 }}>
                {m.text}
              </pre>
              {m.answer && !m.answer.uncertain && m.answer.sources.length > 0 && (
                <div className="chat-sources" style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <span className="muted" style={{ fontSize: '.75rem', fontWeight: 700 }}>📎 관련 근거 목록</span>
                  {m.answer.sources.map((s, idx) => (
                    <div key={idx} className="chat-source-item" style={{ fontSize: '12.5px', marginTop: '4px' }}>
                      <strong>{s.type === 'event' ? '📅 학사 행사' : s.type === 'task' ? '✍️ 업무' : '🤝 카드'}</strong>
                      {' · '}{s.label}
                      {s.type === 'task' && onJumpTask && (
                        <button
                          type="button"
                          className="btn-link"
                          style={{ marginLeft: '.4rem', fontSize: '12px' }}
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
          {isTyping && (
            <div className="chat-bubble bot" style={{ color: '#64748b', fontSize: '13px' }}>
              중대부초 업무 자료를 확인하고 있습니다…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            placeholder="예: 5학년 역사체험 언제야?, 우애남매 활동 언제야?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            aria-label="챗봇 질문 입력"
          />
          <button type="submit" className="btn btn-primary" disabled={!input.trim() || isTyping}>
            보내기
          </button>
        </form>
      </div>
    </section>
  );
}

import { supabase } from './supabaseClient';
import type { FlowStep } from '../lib/flowExtractor';
import { isVerbatim } from '../lib/flowExtractor';
import { newId } from '../lib/id';

export const AI_PROVIDER_LABEL = 'Anthropic Claude API';

/**
 * AI 업무흐름 정리. 브라우저는 AI 키를 갖지 않는다.
 * 로그인한 교사의 토큰으로 Edge Function(ai-flow)을 부르고, 키는 서버 환경변수에만 있다.
 */
export async function extractFlowWithAI(schoolId: string, docTitle: string, text: string): Promise<FlowStep[]> {
  if (!supabase) throw new Error('서버 모드에서만 쓸 수 있다.');
  const { data, error } = await supabase.functions.invoke('ai-flow', { body: { schoolId, docTitle, text } });
  if (error) {
    let msg = error.message;
    try {
      const body = await (error as any).context?.json?.();
      if (body?.error) msg = body.error;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  const steps = (data?.steps ?? []) as Array<{ title: string; due_date: string | null; evidence: string }>;
  // 서버 검증과 별개로, 화면에서도 근거 문장이 원문에 그대로 있는지 다시 확인한다.
  return steps.map((s) => ({
    id: newId(),
    title: String(s.title ?? '').slice(0, 200),
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(s.due_date ?? '') ? s.due_date : null,
    evidence: String(s.evidence ?? ''),
    verified: isVerbatim(String(s.evidence ?? ''), text),
  }));
}

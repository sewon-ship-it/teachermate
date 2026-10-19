import { useEffect, useState, type ReactNode } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export interface SchoolInfo {
  id: string;
  name: string;
  role: string;
}

interface Props {
  sb: SupabaseClient;
  children: (ctx: { session: Session; school: SchoolInfo; signOut: () => Promise<void> }) => ReactNode;
}

/** 서버 모드: 이메일 로그인 → 학교 만들기/초대 코드로 합류 → 앱 */
export function AuthGate({ sb, children }: Props) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [school, setSchool] = useState<SchoolInfo | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  const loadSchool = async () => {
    const { data, error } = await sb.from('memberships').select('role, schools(id, name)').limit(1).maybeSingle();
    if (error) return setError(error.message);
    const s = (data as any)?.schools;
    setSchool(s ? { id: s.id, name: s.name, role: (data as any).role } : null);
  };

  useEffect(() => {
    if (session) loadSchool();
    else setSchool(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const signOut = async () => {
    await sb.auth.signOut();
  };

  if (session === undefined) return <p className="center muted">불러오는 중…</p>;

  if (!session) {
    return (
      <main className="gate">
        <h1>TeacherMate</h1>
        <p className="lead">우리 학교의 1년 업무 지도. 학교 이메일로 로그인 링크를 받는다.</p>
        {sent ? (
          <p className="notice notice-info">{email} 로 로그인 링크를 보냈다. 메일의 링크를 누르면 이 화면으로 돌아온다.</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError('');
              const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
              if (error) setError(error.message);
              else setSent(true);
            }}
          >
            <label>
              이메일
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </label>
            <button className="btn btn-primary" type="submit">
              로그인 링크 받기
            </button>
          </form>
        )}
        {error && <p className="notice notice-block">{error}</p>}
      </main>
    );
  }

  if (school === undefined) return <p className="center muted">학교 정보를 불러오는 중…</p>;

  if (school === null) {
    return (
      <main className="gate">
        <h1>학교 연결</h1>
        <section>
          <h2>초대 코드로 합류</h2>
          <div className="field-row tight">
            <input aria-label="초대 코드" value={code} onChange={(e) => setCode(e.target.value.trim().toUpperCase())} placeholder="예: 3F9A1C0B7D2E" />
            <button
              type="button"
              className="btn btn-primary"
              disabled={!code}
              onClick={async () => {
                setError('');
                const { error } = await sb.rpc('join_school', { invite_code: code });
                if (error) setError('초대 코드가 맞지 않거나 기한이 지났다.');
                else loadSchool();
              }}
            >
              합류
            </button>
          </div>
        </section>
        <section>
          <h2>우리 학교 처음 만들기</h2>
          <p className="hint">만든 사람이 학교 관리자가 되어 동료를 초대한다.</p>
          <div className="field-row tight">
            <input aria-label="학교 이름" value={schoolName} maxLength={100} onChange={(e) => setSchoolName(e.target.value)} placeholder="예: OO초등학교" />
            <button
              type="button"
              className="btn"
              disabled={!schoolName.trim()}
              onClick={async () => {
                setError('');
                const { error } = await sb.rpc('create_school', { school_name: schoolName.trim() });
                if (error) setError(error.message);
                else loadSchool();
              }}
            >
              만들기
            </button>
          </div>
        </section>
        {error && <p className="notice notice-block">{error}</p>}
        <button type="button" className="btn-link" onClick={signOut}>
          다른 계정으로 로그인
        </button>
      </main>
    );
  }

  return <>{children({ session, school, signOut })}</>;
}

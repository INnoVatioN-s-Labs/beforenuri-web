import { useState } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';

type AuthResult = { ok: boolean; message?: string };

type SignupFormProps = {
  onSignup: (username: string, password: string, displayName: string) => Promise<AuthResult>;
  onCancel: () => void;
};

const inputClass =
  'bg-transparent border-b border-terminal-dim text-terminal-input font-mono px-1 py-0.5 outline-none';

/** 회원가입 화면. 성공 시 곧바로 로그인되어 메인으로 돌아간다. */
export function SignupForm({ onSignup, onCancel }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onSignup(username.trim(), password, displayName.trim());
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? '회원가입에 실패했습니다.');
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      void submit();
    }
  };

  return (
    <div className="flex flex-grow flex-col">
      <Panel className="flex-grow p-4">
        <h2 className="mb-4 mt-0 text-[1.2em] text-terminal-accent">회원가입</h2>
        <div className="flex max-w-[320px] flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-terminal-dim">아이디 (영문/숫자/_, 4~20자)</span>
            <input className={inputClass} value={username} autoFocus autoComplete="username"
              onChange={(e) => setUsername(e.target.value)} onKeyDown={onEnter} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-terminal-dim">비밀번호 (8~64자)</span>
            <input type="password" className={inputClass} value={password} autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)} onKeyDown={onEnter} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-terminal-dim">닉네임 (대화/게시판 표시, 1~20자)</span>
            <input className={inputClass} value={displayName}
              onChange={(e) => setDisplayName(e.target.value)} onKeyDown={onEnter} />
          </label>
          {error && <div className="text-terminal-error">{error}</div>}
          <div className="mt-2 flex gap-2.5">
            <Button variant="tool" onClick={submit}>{busy ? '처리 중...' : '가입하고 로그인'}</Button>
            <Button variant="tool" onClick={onCancel}>취소</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

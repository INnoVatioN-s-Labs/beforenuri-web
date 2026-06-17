import { useState } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';

type AuthResult = { ok: boolean; message?: string };

type LoginFormProps = {
  onLogin: (username: string, password: string) => Promise<AuthResult>;
  onGoSignup: () => void;
  onCancel: () => void;
};

const inputClass =
  'bg-transparent border-b border-terminal-dim text-terminal-input font-mono px-1 py-0.5 outline-none';

/** 로그인 화면. 비밀번호는 마스킹 input을 사용한다. */
export function LoginForm({ onLogin, onGoSignup, onCancel }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const result = await onLogin(username.trim(), password);
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? '로그인에 실패했습니다.');
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
        <h2 className="mb-4 mt-0 text-[1.2em] text-terminal-accent">로그인</h2>
        <div className="flex max-w-[320px] flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-terminal-dim">아이디</span>
            <input
              className={inputClass}
              value={username}
              autoFocus
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={onEnter}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-terminal-dim">비밀번호</span>
            <input
              type="password"
              className={inputClass}
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onEnter}
            />
          </label>
          {error && <div className="text-terminal-error">{error}</div>}
          <div className="mt-2 flex gap-2.5">
            <Button variant="tool" onClick={submit}>{busy ? '처리 중...' : '로그인'}</Button>
            <Button variant="tool" onClick={onGoSignup}>회원가입</Button>
            <Button variant="tool" onClick={onCancel}>취소</Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

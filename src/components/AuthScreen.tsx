import { Panel } from '@/components/ui/panel';

export type AuthMode = 'login' | 'signup';
export type AuthStage = 'id' | 'pw' | 'nick';

type AuthScreenProps = {
  mode: AuthMode;
  stage: AuthStage;
  username: string;
  error: string;
};

/** 로그인/회원가입 진행 표시 화면. 입력 자체는 하단 명령창(단계 입력)에서 받는다. */
export function AuthScreen({ mode, stage, username, error }: AuthScreenProps) {
  const title = mode === 'login' ? '로그인' : '회원가입';
  return (
    <div className="flex flex-grow flex-col">
      <Panel className="flex-grow p-4">
        <h2 className="mb-3 mt-0 text-[1.2em] text-terminal-accent">{title}</h2>
        <div className="flex flex-col gap-1">
          <div>
            <span className="text-terminal-dim">아이디 : </span>
            <span className="text-terminal-text">{username || (stage === 'id' ? '_' : '')}</span>
          </div>
          {(stage === 'pw' || stage === 'nick') && (
            <div>
              <span className="text-terminal-dim">비밀번호 : </span>
              <span className="text-terminal-text">{stage === 'pw' ? '_' : '********'}</span>
            </div>
          )}
          {mode === 'signup' && stage === 'nick' && (
            <div>
              <span className="text-terminal-dim">닉네임 : </span>
              <span className="text-terminal-text">_</span>
            </div>
          )}
        </div>
        {error && <div className="mt-3 text-terminal-error">{error}</div>}
        <div className="mt-3 text-terminal-dim">아래 입력창에 입력하고 Enter · 취소: X</div>
      </Panel>
    </div>
  );
}

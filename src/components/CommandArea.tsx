import type { KeyboardEvent, ReactNode, RefObject } from 'react';

export type ScreenContext =
  | 'main'
  | 'chat_menu'
  | 'chat'
  | 'arcade'
  | 'board'
  | 'post'
  | 'write'
  | 'auth';

const PROMPTS: Record<ScreenContext, ReactNode> = {
  main: (
    <>
      번호/명령(GO,T,ZAR,DRAG,X)
      <br />
      선택(H:도움말) &gt;&gt;
    </>
  ),
  chat_menu: (
    <>
      대화방 선택(P:이전화면)
      <br />
      선택 &gt;&gt;
    </>
  ),
  chat: (
    <>
      대화입력(/나가기, /목록, X, P:이전)
      <br />
      선택(H:도움말) &gt;&gt;
    </>
  ),
  arcade: (
    <>
      숫자 입력 (R:다시, X:나가기)
      <br />
      선택 &gt;&gt;
    </>
  ),
  board: (
    <>
      게시판 (번호:읽기, K:새글, P:이전)
      <br />
      선택 &gt;&gt;
    </>
  ),
  post: (
    <>
      글 보기 (W:답글, P:목록, TOP:초기)
      <br />
      선택 &gt;&gt;
    </>
  ),
  write: (
    <>
      입력 후 Enter로 진행
      <br />
      입력 &gt;&gt;
    </>
  ),
  // auth는 단계별 프롬프트를 promptOverride로 주입하므로 여기 값은 폴백용이다.
  auth: <>입력 &gt;&gt;</>,
};

type CommandAreaProps = {
  context: ScreenContext;
  command: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
  onSubmit: (cmd: string) => void;
  /** 비밀번호 등 입력값을 가릴 때 true (input type=password) */
  mask?: boolean;
  /** context 기본 프롬프트 대신 표시할 동적 프롬프트(예: 로그인 단계별) */
  promptOverride?: ReactNode;
};

/** 하단 명령어 입력 영역. */
export function CommandArea({ context, command, inputRef, onChange, onSubmit, mask, promptOverride }: CommandAreaProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 발생한 Enter는 글자 확정용이므로 무시한다.
    // 이를 거르지 않으면 조합 중이던 끝글자가 별도 메시지로 한 번 더 전송된다.
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === 'Enter') {
      const cmd = command.trim();
      if (cmd) {
        onSubmit(cmd);
      }
      onChange('');
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-end">
      <div className="whitespace-nowrap text-terminal-dim">{promptOverride ?? PROMPTS[context]}</div>
      <input
        ref={inputRef}
        type={mask ? 'password' : 'text'}
        className="mt-2 w-full flex-grow border-b border-terminal-dim bg-transparent px-1 py-0.5 font-mono text-[18px] text-terminal-input outline-none sm:mt-0 sm:w-auto"
        autoComplete="off"
        autoFocus
        value={command}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

import type { ReactNode } from 'react';

/** 단말기 화면 외곽: 검정 레터박스 + 최대 920px 그라디언트 패널. */
export function Terminal({ children }: { children: ReactNode }) {
  return (
    <div className="m-0 flex min-h-screen w-full justify-center bg-black p-0 font-mono text-[clamp(14px,2vw,16px)] text-terminal-text">
      <div className="box-border flex min-h-screen w-full max-w-[920px] flex-col bg-gradient-to-b from-terminal-bg to-terminal-bgAlt p-5">
        {children}
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { Panel } from '@/components/ui/panel';

type ArcadeProps = {
  log: string[];
};

/** 오락실 화면. 게임 로그를 표시하고 새 줄이 추가되면 하단으로 스크롤한다. */
export function Arcade({ log }: ArcadeProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <Panel className="mt-4 flex flex-grow flex-col p-4">
      <h2 className="mt-0 text-[1.2em] text-terminal-accent">오락실 — 숫자 맞히기</h2>
      <div
        ref={outputRef}
        className="mb-3 h-[400px] flex-grow overflow-y-auto whitespace-pre-wrap text-terminal-text"
      >
        {log.map((line, i) => (
          <div key={i} className={line.startsWith('>') ? 'text-terminal-input' : 'text-terminal-text'}>
            {line}
          </div>
        ))}
      </div>
    </Panel>
  );
}

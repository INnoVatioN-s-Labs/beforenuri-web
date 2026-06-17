import { useEffect, useRef } from 'react';
import { Panel } from '@/components/ui/panel';
import type { Message } from '@/types';

type ChatRoomProps = {
  roomId: number | null;
  messages: Message[];
};

/** 대화실 화면. 새 메시지가 오면 하단으로 자동 스크롤한다. */
export function ChatRoom({ roomId, messages }: ChatRoomProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Panel className="mt-4 flex flex-grow flex-col p-4">
      <h2 className="mt-0 text-[1.2em] text-terminal-accent">{roomId}번 대화실</h2>
      <div
        ref={outputRef}
        className="mb-3 h-[400px] flex-grow overflow-y-auto whitespace-pre-wrap text-terminal-text"
      >
        {messages.map((m, i) => {
          if (m.type === 'chat') {
            return (
              <div key={i} className="text-terminal-text">
                {m.time && <span className="text-terminal-dim">[{m.time}] </span>}
                [{m.id}]: {m.msg}
              </div>
            );
          }
          if (m.type === 'sysop') {
            return (
              <div key={i} className="text-terminal-accent">
                SYSOP: {m.msg}
              </div>
            );
          }
          return (
            <div key={i} className="text-terminal-dim">
              *** {m.msg} ***
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

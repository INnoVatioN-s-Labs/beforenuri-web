import { useTypewriter } from '@/hooks/useTypewriter';

const CONNECT_LINES = ['ATDT 01410', 'CONNECT 9600', '*** 모뎀 연결 성공 ***'];

/** 대화실 입장 시 한 글자씩 타이핑되는 모뎀 접속 로그. */
export function ConnectSequence() {
  const { shownLines } = useTypewriter(CONNECT_LINES);
  return (
    <div className="mb-2 text-terminal-dim">
      {shownLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}

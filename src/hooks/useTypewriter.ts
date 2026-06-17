import { useEffect, useState } from 'react';

/** 여러 줄을 한 글자씩 순차 출력하는 타이핑 효과. lines가 바뀌면 처음부터 다시 친다. */
export function useTypewriter(lines: string[], charDelayMs = 35) {
  const [shownLines, setShownLines] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  // 배열 참조가 매 렌더 달라져도 내용이 같으면 재실행하지 않도록 문자열 키로 비교한다.
  const key = lines.join('\n');

  useEffect(() => {
    setShownLines([]);
    setDone(false);

    const allLines = key.length ? key.split('\n') : [];
    const acc: string[] = [];
    let lineIdx = 0;
    let charIdx = 0;
    let timer: number;

    const tick = () => {
      if (lineIdx >= allLines.length) {
        setDone(true);
        return;
      }
      const current = allLines[lineIdx];
      charIdx += 1;
      acc[lineIdx] = current.slice(0, charIdx);
      setShownLines([...acc]);
      if (charIdx >= current.length) {
        lineIdx += 1;
        charIdx = 0;
      }
      timer = window.setTimeout(tick, charDelayMs);
    };

    timer = window.setTimeout(tick, charDelayMs);
    return () => window.clearTimeout(timer);
  }, [key, charDelayMs]);

  return { shownLines, done };
}

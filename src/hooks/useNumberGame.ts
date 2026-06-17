import { useState } from 'react';

const MIN = 1;
const MAX = 100;

function pickAnswer() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

const intro = () => `${MIN}~${MAX} 사이의 숫자를 맞혀보세요. (숫자 입력 / R:다시 / X:나가기)`;

/** 오락실 숫자 맞히기(업/다운) 게임 상태. */
export function useNumberGame() {
  const [answer, setAnswer] = useState(pickAnswer);
  const [tries, setTries] = useState(0);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<string[]>([intro()]);

  const guess = (raw: string) => {
    if (done) {
      setLog((prev) => [...prev, '이미 끝난 게임입니다. R을 입력해 다시 시작하세요.']);
      return;
    }
    const n = Number.parseInt(raw, 10);
    if (Number.isNaN(n)) {
      setLog((prev) => [...prev, `> ${raw}`, '숫자를 입력해주세요.']);
      return;
    }
    const nextTries = tries + 1;
    setTries(nextTries);
    if (n === answer) {
      setLog((prev) => [...prev, `> ${n}`, `정답! ${nextTries}번 만에 맞혔습니다. (R:다시하기)`]);
      setDone(true);
    } else {
      setLog((prev) => [...prev, `> ${n}`, n < answer ? '↑ 업! 더 큰 숫자입니다.' : '↓ 다운! 더 작은 숫자입니다.']);
    }
  };

  const reset = () => {
    setAnswer(pickAnswer());
    setTries(0);
    setDone(false);
    setLog([intro()]);
  };

  return { log, tries, done, guess, reset };
}

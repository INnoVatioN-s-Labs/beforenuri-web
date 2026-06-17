import { useEffect, useRef, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import type { AnonymousSessionResponse } from '@/types';

/** 익명 세션을 발급받아 닉네임과 세션 토큰을 제공한다. */
export function useAnonymousSession() {
  const [senderName, setSenderName] = useState('');
  // STOMP CONNECT 시점 클로저에서 최신값이 필요하므로 ref로도 보관한다.
  const sessionTokenRef = useRef('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/session/anonymous'), { method: 'POST' });
        if (!res.ok) throw new Error(`session failed: ${res.status}`);
        const data: AnonymousSessionResponse = await res.json();
        if (!cancelled) {
          setSenderName(data.displayName);
          sessionTokenRef.current = data.sessionToken;
        }
      } catch (err) {
        console.error('익명 세션 발급 실패', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { senderName, sessionTokenRef };
}

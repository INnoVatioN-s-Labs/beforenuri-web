import { useEffect, useRef, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import type { AnonymousSessionResponse, AuthTokenResponse } from '@/types';

const REFRESH_TOKEN_KEY = 'beforenuri.refreshToken';

/**
 * 사용자 신원(세션 토큰 + 표시 닉네임)을 관리한다.
 * - 시작 시 저장된 refreshToken이 있으면 회원 자동 로그인을 시도하고, 실패하면 익명 세션을 발급한다.
 * - 채팅/게시판은 sessionTokenRef.current(회원 atk 또는 익명 토큰)를 그대로 사용한다.
 */
export function useSession() {
  const [senderName, setSenderName] = useState('');
  const [isMember, setIsMember] = useState(false);
  const sessionTokenRef = useRef('');

  const issueAnonymous = async (): Promise<boolean> => {
    try {
      const res = await fetch(getApiUrl('/api/session/anonymous'), { method: 'POST' });
      if (!res.ok) return false;
      const data: AnonymousSessionResponse = await res.json();
      sessionTokenRef.current = data.sessionToken;
      setSenderName(data.displayName);
      setIsMember(false);
      return true;
    } catch (err) {
      console.error('익명 세션 발급 실패', err);
      return false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (storedRefreshToken) {
        try {
          const res = await fetch(getApiUrl('/api/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: storedRefreshToken }),
          });
          if (res.ok) {
            const data: AuthTokenResponse = await res.json();
            if (!cancelled) {
              sessionTokenRef.current = data.accessToken;
              localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
              setSenderName(data.displayName);
              setIsMember(true);
            }
            return;
          }
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        } catch {
          localStorage.removeItem(REFRESH_TOKEN_KEY);
        }
      }
      if (!cancelled) {
        await issueAnonymous();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** 로그인/가입 성공 시 회원 세션으로 전환한다. */
  const applyMemberSession = (accessToken: string, refreshToken: string, displayName: string) => {
    sessionTokenRef.current = accessToken;
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setSenderName(displayName);
    setIsMember(true);
  };

  /** 로그아웃: 서버 rtk 폐기 후 익명 세션으로 복귀한다. */
  const logoutToAnonymous = async () => {
    const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (storedRefreshToken) {
      try {
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        });
      } catch {
        // 폐기 실패해도 로컬은 정리한다.
      }
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    await issueAnonymous();
  };

  return { senderName, isMember, sessionTokenRef, applyMemberSession, logoutToAnonymous };
}

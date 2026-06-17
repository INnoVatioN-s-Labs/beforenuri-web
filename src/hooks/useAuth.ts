import { getApiUrl } from '@/lib/api';
import type { AuthTokenResponse } from '@/types';

type AuthResult = { ok: boolean; message?: string };

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data?.message ?? fallback;
  } catch {
    return fallback;
  }
}

/** 회원가입 / 로그인 API. 성공 시 applyMemberSession으로 세션을 전환한다. */
export function useAuth(
  applyMemberSession: (accessToken: string, refreshToken: string, displayName: string) => void,
) {
  const login = async (username: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        return { ok: false, message: await readErrorMessage(res, '로그인에 실패했습니다.') };
      }
      const data: AuthTokenResponse = await res.json();
      applyMemberSession(data.accessToken, data.refreshToken, data.displayName);
      return { ok: true };
    } catch {
      return { ok: false, message: '서버에 연결할 수 없습니다.' };
    }
  };

  const signup = async (username: string, password: string, displayName: string): Promise<AuthResult> => {
    try {
      const res = await fetch(getApiUrl('/api/auth/signup'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName }),
      });
      if (!res.ok) {
        return { ok: false, message: await readErrorMessage(res, '회원가입에 실패했습니다.') };
      }
      // 가입 성공 시 곧바로 로그인 처리
      return login(username, password);
    } catch {
      return { ok: false, message: '서버에 연결할 수 없습니다.' };
    }
  };

  return { login, signup };
}

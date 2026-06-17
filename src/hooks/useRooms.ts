import { useEffect, useState } from 'react';
import { getApiUrl } from '@/lib/api';
import type { RoomResponse } from '@/types';

/** 대화실 목록을 조회한다. */
export function useRooms() {
  const [rooms, setRooms] = useState<RoomResponse[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/rooms'));
        if (!res.ok) throw new Error(`rooms failed: ${res.status}`);
        const data: RoomResponse[] = await res.json();
        if (!cancelled) {
          setRooms(data);
        }
      } catch (err) {
        console.error('채팅방 목록 조회 실패', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return rooms;
}

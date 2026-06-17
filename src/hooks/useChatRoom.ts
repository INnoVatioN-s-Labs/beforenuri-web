import { useEffect, useRef, useState, type RefObject } from 'react';
import { Client, type IFrame, type IMessage } from '@stomp/stompjs';
import { getApiUrl, getWebSocketUrl } from '@/lib/api';
import { toUiMessage } from '@/lib/messages';
import type { ChatMessageResponse, ChatSocketMessageResponse, Message } from '@/types';

/**
 * 채팅방 입장/퇴장과 STOMP 실시간 메시지 송수신을 관리한다.
 * 발신자 신원은 서버가 CONNECT 시점의 sessionToken으로 고정하므로, 전송 시 content만 보낸다.
 */
export function useChatRoom(sessionTokenRef: RefObject<string>, senderName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  const teardownStomp = async () => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch {
        // ignore
      }
      subscriptionRef.current = null;
    }
    if (stompClientRef.current) {
      await stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
  };

  const enterRoom = async (roomId: number) => {
    setCurrentRoom(roomId);
    setMessages([]);

    // 과거 메시지 불러오기
    try {
      const res = await fetch(getApiUrl(`/api/rooms/${roomId}/messages`));
      if (res.ok) {
        const history: ChatMessageResponse[] = await res.json();
        setMessages(history.map(toUiMessage));
      } else if (res.status === 404) {
        setMessages([{ type: 'system', msg: '존재하지 않는 채팅방입니다.' }]);
      }
    } catch (err) {
      console.error('과거 메시지 조회 실패', err);
    }

    // 기존 STOMP 연결 정리 후 재연결
    await teardownStomp();

    const client = new Client({
      brokerURL: getWebSocketUrl('/ws'),
      connectHeaders: { sessionToken: sessionTokenRef.current },
      reconnectDelay: 3000,
      onConnect: () => {
        subscriptionRef.current = client.subscribe(`/topic/rooms/${roomId}`, (frame: IMessage) => {
          try {
            const payload: ChatSocketMessageResponse = JSON.parse(frame.body);
            setMessages((prev) => [...prev, toUiMessage(payload)]);
          } catch (err) {
            console.error('STOMP 메시지 파싱 실패', err);
          }
        });
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP 에러', frame.headers['message'], frame.body);
      },
    });
    stompClientRef.current = client;
    client.activate();
  };

  const exitRoom = () => {
    setCurrentRoom(null);
    void teardownStomp();
  };

  const publishMessage = (content: string) => {
    const client = stompClientRef.current;
    if (!client || !client.connected || currentRoom === null) {
      console.warn('STOMP 미연결 상태로 전송 불가');
      return;
    }
    if (!senderName) {
      alert('아직 닉네임을 받아오지 못했습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    // 발신자 이름은 서버가 세션 토큰으로 결정하므로 content만 전송한다.
    client.publish({
      destination: `/app/rooms/${currentRoom}/messages`,
      body: JSON.stringify({ content }),
    });
  };

  const clearMessages = () => setMessages([]);

  useEffect(() => {
    return () => {
      void teardownStomp();
    };
  }, []);

  return { messages, currentRoom, enterRoom, exitRoom, publishMessage, clearMessages };
}

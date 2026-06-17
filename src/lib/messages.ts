import type { ChatMessageResponse, ChatSocketMessageResponse, Message } from '@/types';

/** ISO 시각 문자열을 HH:MM(24시간)으로 변환한다. 파싱 실패 시 undefined. */
function formatTime(createdAt: string | undefined): string | undefined {
  if (!createdAt) return undefined;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** 서버 메시지(REST/STOMP)를 화면 표시용 Message로 변환한다. */
export const toUiMessage = (m: ChatSocketMessageResponse | ChatMessageResponse): Message => {
  const messageType = 'messageType' in m ? m.messageType : m.type;
  const senderName = m.senderName;
  const content = m.content;
  const time = formatTime(m.createdAt);
  if (messageType === 'SYSOP') {
    return { type: 'sysop', msg: content, time };
  }
  if (messageType === 'SYSTEM') {
    return { type: 'system', msg: content, time };
  }
  return { type: 'chat', id: senderName, msg: content, time };
};

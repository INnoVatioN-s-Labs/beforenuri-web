import type { ChatMessageResponse, ChatSocketMessageResponse, Message } from '@/types';

/** 서버 메시지(REST/STOMP)를 화면 표시용 Message로 변환한다. */
export const toUiMessage = (m: ChatSocketMessageResponse | ChatMessageResponse): Message => {
  const messageType = 'messageType' in m ? m.messageType : m.type;
  const senderName = m.senderName;
  const content = m.content;
  if (messageType === 'SYSOP') {
    return { type: 'sysop', msg: content };
  }
  if (messageType === 'SYSTEM') {
    return { type: 'system', msg: content };
  }
  return { type: 'chat', id: senderName, msg: content };
};

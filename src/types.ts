// 화면 표시용 메시지 모델
export type Message = {
  type: 'chat' | 'system' | 'sysop';
  id?: string;
  msg: string;
  time?: string; // HH:MM (서버 createdAt 기반, 클라이언트 생성 메시지는 없음)
};

// WebSocket(STOMP)로 수신하는 메시지 payload
export type ChatSocketMessageResponse = {
  type: string;
  messageId: string;
  roomId: number;
  senderName: string;
  content: string;
  createdAt: string;
};

// REST로 조회하는 과거 메시지 payload
export type ChatMessageResponse = {
  id: string;
  roomId: number;
  senderName: string;
  messageType: string;
  content: string;
  createdAt: string;
};

// 익명 세션 발급 응답
export type AnonymousSessionResponse = {
  sessionToken: string;
  displayName: string;
};

// 채팅방 메타데이터
export type RoomResponse = {
  id: number;
  code: number;
  title: string;
  description: string;
  category: string;
  active: boolean;
};

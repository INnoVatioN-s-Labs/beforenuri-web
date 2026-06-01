import React, { useState, useEffect, useRef } from 'react';
import { Client, type IFrame, type IMessage } from '@stomp/stompjs';

// types
type Message = {
  type: 'chat' | 'system' | 'sysop';
  id?: string;
  msg: string;
};

type ChatSocketMessageResponse = {
  type: string;
  messageId: string;
  roomId: number;
  senderName: string;
  content: string;
  createdAt: string;
};

type ChatMessageResponse = {
  id: string;
  roomId: number;
  senderName: string;
  messageType: string;
  content: string;
  createdAt: string;
};

type AnonymousSessionResponse = {
  sessionToken: string;
  displayName: string;
};

const toUiMessage = (m: ChatSocketMessageResponse | ChatMessageResponse): Message => {
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

function getBackendBaseUrl() {
  const configuredUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  if (import.meta.env.DEV) {
    return `http://${window.location.hostname}:8080`;
  }

  return window.location.origin;
}

function getApiUrl(path: string) {
  return `${getBackendBaseUrl()}${path}`;
}

function getWebSocketUrl(path: string) {
  const baseUrl = getBackendBaseUrl();

  if (baseUrl.startsWith('https://')) {
    return `wss://${baseUrl.slice('https://'.length)}${path}`;
  }

  if (baseUrl.startsWith('http://')) {
    return `ws://${baseUrl.slice('http://'.length)}${path}`;
  }

  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${path}`;
}

function App() {
  const [context, setContext] = useState<'main' | 'chat_menu' | 'chat'>('main');
  const [messages, setMessages] = useState<Message[]>([]);
  const [command, setCommand] = useState('');
  const [currentRoom, setCurrentRoom] = useState<number | null>(null);
  const [senderName, setSenderName] = useState<string>('');

  const stompClientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const chatOutputRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  // 익명 세션 발급
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/session/anonymous'), { method: 'POST' });
        if (!res.ok) throw new Error(`session failed: ${res.status}`);
        const data: AnonymousSessionResponse = await res.json();
        if (!cancelled) setSenderName(data.displayName);
      } catch (err) {
        console.error('익명 세션 발급 실패', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (chatOutputRef.current) {
      chatOutputRef.current.scrollTop = chatOutputRef.current.scrollHeight;
    }
  }, [messages, context]);

  // Body 클릭 시 항상 입력창 포커스
  useEffect(() => {
    const handleBodyClick = () => {
      commandInputRef.current?.focus();
    };
    document.body.addEventListener('click', handleBodyClick);
    return () => document.body.removeEventListener('click', handleBodyClick);
  }, []);

  const handleCommandSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 한글 IME 조합 중 발생한 Enter는 글자 확정용이므로 무시한다.
    // 이를 거르지 않으면 조합 중이던 끝글자가 별도 메시지로 한 번 더 전송된다.
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === 'Enter') {
      const cmd = command.trim();
      if (cmd) {
        handleCommand(cmd);
      }
      setCommand('');
    }
  };

  const handleCommand = (cmd: string) => {
    const upperCmd = cmd.toUpperCase();

    if (context === 'main') {
      if (upperCmd === '14' || upperCmd === 'GO CHAT') {
        setContext('chat_menu');
      } else if (upperCmd === 'H') {
        alert('도움말: 대화실에 입장하려면 14번을 누르거나 GO CHAT을 입력하세요.');
      } else if (upperCmd === 'T' || upperCmd === 'TOP' || upperCmd === 'X') {
        alert('현재 초기 메뉴 화면입니다.');
      } else {
        alert(`'${cmd}' - 현재 구현되지 않은 메뉴/명령어입니다.\n14번 대화실을 이용해주세요.`);
      }
    } else if (context === 'chat_menu') {
      if (upperCmd === 'P' || upperCmd === 'T' || upperCmd === 'TOP' || upperCmd === 'X') {
        setContext('main');
      } else {
        const roomNum = parseInt(cmd);
        if (!isNaN(roomNum)) {
          enterChatRoom(roomNum);
        } else {
          alert('올바른 방 번호를 입력하세요.');
        }
      }
    } else if (context === 'chat') {
      if (upperCmd === 'X' || upperCmd === '/나가기' || upperCmd === 'P') {
        exitChatRoom();
      } else if (upperCmd === 'T' || upperCmd === 'TOP') {
        exitChatRoom();
        setContext('main');
      } else {
        publishMessage(cmd);
      }
    }
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
    client.publish({
      destination: `/app/rooms/${currentRoom}/messages`,
      body: JSON.stringify({ senderName, content }),
    });
  };

  const enterChatRoom = async (roomId: number) => {
    setCurrentRoom(roomId);
    setContext('chat');
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

    // 기존 STOMP 연결 정리
    await teardownStomp();

    // STOMP 연결
    const wsUrl = getWebSocketUrl('/ws');
    const client = new Client({
      brokerURL: wsUrl,
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

  const exitChatRoom = () => {
    setCurrentRoom(null);
    setContext('chat_menu');
    void teardownStomp();
  };

  useEffect(() => {
    return () => {
      void teardownStomp();
    };
  }, []);

  const playModemSound = () => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
    osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  };

  const clearScreen = () => {
    if (context === 'chat') {
      setMessages([]);
    } else {
      alert('화면이 초기화 되었습니다.');
    }
  };

  return (
    <div className="bg-black min-h-screen w-full flex justify-center font-mono text-[clamp(14px,2vw,16px)] text-[#f8f8f8] p-0 m-0">
      <div className="w-full max-w-[920px] min-h-screen p-5 box-border flex flex-col" style={{ background: 'linear-gradient(180deg, #000078 0%, #00005f 100%)' }}>

        {/* Topbar */}
        <div className="grid grid-cols-[auto_1fr_auto] gap-2.5 border-b-2 border-[#000044] pb-2.5 mb-5 items-center">
          <div className="bg-[#f8f8f8] text-[#000078] px-2 py-0.5 font-bold"> NOW.NURI.NET </div>
          <div className="text-center text-[1.2em] font-bold">나우누리 (NOW NURI)</div>
          <div className="cursor-pointer">TOP</div>
        </div>

        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1 border border-[#f8f8f8] bg-[#f8f8f8] text-[#000078] font-bold">Communication</span>
        </div>

        {/* Panels */}
        <div className="flex flex-col flex-grow">

          {/* Main Menu */}
          {context === 'main' && (
            <div className="flex flex-col flex-grow">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-8 w-full sm:w-[680px] mx-auto text-[clamp(17px,3vw,22px)]">
                {['1. 공지사항', '11. 자유게시판', '14. 대화실', '2. 시삽소개', '12. 유머게시판', '15. 자료실', '3. 환경설정', '13. 친구찾아요', '16. 오락실'].map((item) => (
                  <button key={item} className="bg-transparent border-none text-[#f8f8f8] text-left cursor-pointer hover:text-[#ffff66] hover:underline focus:text-[#ffff66] focus:underline" onClick={() => handleCommand(item.split('.')[0])}>{item}</button>
                ))}
              </div>
              <div className="text-[#aeb5ff] whitespace-nowrap overflow-hidden my-5 text-center">--------------------------------------------------------------------------------</div>
              <div className="text-center text-[#9aa1ff] mb-5">
                안녕하세요! 새로운 PC통신 시대에 오신 것을 환영합니다.<br />
                대화실 접속을 원하시면 '14' 또는 'GO CHAT'을 입력해주세요.
                {senderName && (
                  <>
                    <br />
                    당신의 닉네임은 <span className="text-[#ffff66]">{senderName}</span> 입니다.
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chat Menu */}
          {context === 'chat_menu' && (
            <div className="flex flex-col flex-grow">
              <h2 className="text-center text-[#ffff66] text-[1.2em] mt-0 mb-4">대화실 [분류]</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                {[
                  { title: '평범함이 좋아', items: ['1. 느낌있는 대화', '2. 자유로운 대화', '3. 초보자 대화실', '4. 타 자 방'] },
                  { title: '지역별 대화실', items: ['21. 서울특별시', '22. 인천/경기/강원', '23. 대전/충청', '24. 광주/전라', '25. 대구/울산/경상', '26. 부산/제주'] },
                  { title: '우리끼리 좋아', items: ['41. 초등학생 끼리끼리', '42. 중학생 모여라', '43. 고등학생 대화실', '44. 대학생 대화실', '45. 직장인의 휴식처', '46. 게임좋아하는 사람'] },
                ].map(category => (
                  <div key={category.title} className="border border-dashed border-white/40 p-3 flex flex-col">
                    <div className="text-center mb-3 text-[1.1em] bg-[#f8f8f8] text-[#000078] font-bold py-0.5">{category.title}</div>
                    <div className="flex flex-col gap-1">
                      {category.items.map(item => (
                        <div key={item} className="whitespace-nowrap">
                          <button className="bg-transparent border-none text-[#f8f8f8] text-left cursor-pointer hover:text-[#ffff66] hover:underline" onClick={() => handleCommand(item.split('.')[0])}>{item}</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-[#aeb5ff] whitespace-nowrap overflow-hidden my-5 text-center">--------------------------------------------------------------------------------</div>
              <div className="text-center text-[#9aa1ff] mb-5">
                원하시는 대화방 번호를 입력해주세요. (이전 화면으로 돌아가려면 P 입력)
              </div>
            </div>
          )}

          {/* Chat Room */}
          {context === 'chat' && (
            <div className="flex flex-col flex-grow border border-dashed border-white/40 p-4 mt-4">
              <h2 className="text-[#ffff66] mt-0 text-[1.2em]">{currentRoom}번 대화실</h2>
              <div ref={chatOutputRef} className="flex-grow text-[#f8f8f8] whitespace-pre-wrap h-[400px] overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-[#aeb5ff] scrollbar-track-[#00005f]">
                {messages.map((m, i) => {
                  if (m.type === 'chat') return <div key={i} className="text-[#f8f8f8]">[{m.id}]: {m.msg}</div>;
                  if (m.type === 'sysop') return <div key={i} className="text-[#ffff66]">SYSOP: {m.msg}</div>;
                  return <div key={i} className="text-[#9aa1ff]">*** {m.msg} ***</div>;
                })}
              </div>
            </div>
          )}

        </div>

        {/* Command Area */}
        <div className="flex flex-col sm:flex-row sm:items-end mt-5 gap-2.5">
          <div className="text-[#9aa1ff] whitespace-nowrap" dangerouslySetInnerHTML={{
            __html: context === 'main' ? `번호/명령(GO,T,ZAR,DRAG,X)<br>선택(H:도움말) &gt;&gt;`
                  : context === 'chat_menu' ? `대화방 선택(P:이전화면)<br>선택 &gt;&gt;`
                  : `대화입력(/나가기, X, P:이전)<br>선택(H:도움말) &gt;&gt;`
          }} />
          <input
            ref={commandInputRef}
            type="text"
            className="flex-grow bg-transparent border-none border-b border-[#9aa1ff] text-[#83ff9b] font-mono text-[18px] px-1 py-0.5 outline-none w-full sm:w-auto mt-2 sm:mt-0"
            autoComplete="off"
            autoFocus
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleCommandSubmit}
          />
        </div>

        {/* Tools */}
        <div className="mt-5 flex gap-2.5 justify-center">
          <button onClick={() => handleCommand('H')} className="border border-[#aeb5ff] bg-[#00005f] text-[#9aa1ff] font-mono px-4 py-1 cursor-pointer hover:text-[#ffff66]">도움말</button>
          <button onClick={playModemSound} className="border border-[#aeb5ff] bg-[#00005f] text-[#9aa1ff] font-mono px-4 py-1 cursor-pointer hover:text-[#ffff66]">모뎀 접속음 재생</button>
          <button onClick={clearScreen} className="border border-[#aeb5ff] bg-[#00005f] text-[#9aa1ff] font-mono px-4 py-1 cursor-pointer hover:text-[#ffff66]">초기화</button>
        </div>

        <div className="mt-auto pt-5 text-center text-[#9aa1ff] text-[0.9em]">
          [H]도움말 [X]종료 [TOP]초기화면
        </div>

      </div>
    </div>
  );
}

export default App;

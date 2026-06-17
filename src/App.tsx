import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@/components/Terminal';
import { TopBar } from '@/components/TopBar';
import { InverseBadge } from '@/components/ui/inverse-badge';
import { MainMenu } from '@/components/MainMenu';
import { RoomList } from '@/components/RoomList';
import { ChatRoom } from '@/components/ChatRoom';
import { CommandArea, type ScreenContext } from '@/components/CommandArea';
import { Tools } from '@/components/Tools';
import { Footer } from '@/components/Footer';
import { useAnonymousSession } from '@/hooks/useAnonymousSession';
import { useRooms } from '@/hooks/useRooms';
import { useChatRoom } from '@/hooks/useChatRoom';
import { playModemSound } from '@/lib/audio';

function App() {
  const [context, setContext] = useState<ScreenContext>('main');
  const [command, setCommand] = useState('');
  const commandInputRef = useRef<HTMLInputElement>(null);

  const { senderName, sessionTokenRef } = useAnonymousSession();
  const rooms = useRooms();
  const { messages, currentRoom, enterRoom, exitRoom, publishMessage, clearMessages } =
    useChatRoom(sessionTokenRef, senderName);

  // Body 클릭 시 항상 입력창 포커스
  useEffect(() => {
    const handleBodyClick = () => {
      commandInputRef.current?.focus();
    };
    document.body.addEventListener('click', handleBodyClick);
    return () => document.body.removeEventListener('click', handleBodyClick);
  }, []);

  const enterChatRoom = (roomId: number) => {
    setContext('chat');
    void enterRoom(roomId);
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
        // 사용자가 입력하는 번호는 화면에 보이는 code이므로, 실제 roomId(DB id)로 변환해 입장한다.
        const roomCode = parseInt(cmd);
        const room = rooms.find((r) => r.code === roomCode);
        if (room) {
          enterChatRoom(room.id);
        } else {
          alert('올바른 방 번호를 입력하세요.');
        }
      }
    } else if (context === 'chat') {
      if (upperCmd === 'X' || upperCmd === '/나가기' || upperCmd === 'P') {
        exitRoom();
        setContext('chat_menu');
      } else if (upperCmd === 'T' || upperCmd === 'TOP') {
        exitRoom();
        setContext('main');
      } else {
        publishMessage(cmd);
      }
    }
  };

  const clearScreen = () => {
    if (context === 'chat') {
      clearMessages();
    } else {
      alert('화면이 초기화 되었습니다.');
    }
  };

  return (
    <Terminal>
      <TopBar />

      <div className="mb-8 text-center">
        <InverseBadge>Communication</InverseBadge>
      </div>

      <div className="flex flex-grow flex-col">
        {context === 'main' && <MainMenu senderName={senderName} onSelect={handleCommand} />}
        {context === 'chat_menu' && <RoomList rooms={rooms} onEnter={enterChatRoom} />}
        {context === 'chat' && <ChatRoom roomId={currentRoom} messages={messages} />}
      </div>

      <CommandArea
        context={context}
        command={command}
        inputRef={commandInputRef}
        onChange={setCommand}
        onSubmit={handleCommand}
      />

      <Tools onHelp={() => handleCommand('H')} onModemSound={playModemSound} onClear={clearScreen} />

      <Footer />
    </Terminal>
  );
}

export default App;

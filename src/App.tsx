import { useEffect, useRef, useState } from 'react';
import { Terminal } from '@/components/Terminal';
import { TopBar } from '@/components/TopBar';
import { InverseBadge } from '@/components/ui/inverse-badge';
import { MainMenu } from '@/components/MainMenu';
import { RoomList } from '@/components/RoomList';
import { ChatRoom } from '@/components/ChatRoom';
import { Arcade } from '@/components/Arcade';
import { BoardList } from '@/components/BoardList';
import { PostView } from '@/components/PostView';
import { PostWrite } from '@/components/PostWrite';
import { CommandArea, type ScreenContext } from '@/components/CommandArea';
import { Tools } from '@/components/Tools';
import { Footer } from '@/components/Footer';
import type { PanelKey } from '@/components/InfoPanel';
import { useAnonymousSession } from '@/hooks/useAnonymousSession';
import { useRooms } from '@/hooks/useRooms';
import { useChatRoom } from '@/hooks/useChatRoom';
import { useNumberGame } from '@/hooks/useNumberGame';
import { useBoard } from '@/hooks/useBoard';
import { playModemSound } from '@/lib/audio';

function App() {
  const [context, setContext] = useState<ScreenContext>('main');
  const [command, setCommand] = useState('');
  const [activePanel, setActivePanel] = useState<PanelKey | null>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const { senderName, sessionTokenRef } = useAnonymousSession();
  const rooms = useRooms();
  const { messages, currentRoom, occupantCount, enterRoom, exitRoom, publishMessage, clearMessages, showOccupants } =
    useChatRoom(sessionTokenRef, senderName);
  const game = useNumberGame();
  const board = useBoard(sessionTokenRef);

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
    playModemSound(); // 입장 시 모뎀 접속음 연출
    void enterRoom(roomId);
  };

  const handleCommand = (cmd: string) => {
    const upperCmd = cmd.toUpperCase();

    if (context === 'main') {
      if (upperCmd === '14' || upperCmd === 'GO CHAT') {
        setActivePanel(null);
        setContext('chat_menu');
      } else if (upperCmd === '1' || upperCmd === 'GO NOTICE') {
        setActivePanel('notice');
      } else if (upperCmd === '2') {
        setActivePanel('sysop');
      } else if (upperCmd === '3') {
        setActivePanel('config');
      } else if (upperCmd === 'H') {
        setActivePanel('help');
      } else if (upperCmd === '11' || upperCmd === 'GO FREE') {
        setActivePanel(null);
        void board.fetchPosts();
        setContext('board');
      } else if (upperCmd === '16' || upperCmd === 'DRAG') {
        setActivePanel(null);
        game.reset();
        setContext('arcade');
      } else if (upperCmd === 'T' || upperCmd === 'TOP' || upperCmd === 'X') {
        setActivePanel(null);
      } else {
        // 아직 구현되지 않은 메뉴(자유게시판/유머게시판/자료실 등)
        setActivePanel('preparing');
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
      } else if (upperCmd === '/목록' || upperCmd === '/WHO' || upperCmd === '/W') {
        void showOccupants();
      } else {
        publishMessage(cmd);
      }
    } else if (context === 'arcade') {
      if (upperCmd === 'X' || upperCmd === 'P' || upperCmd === 'T' || upperCmd === 'TOP') {
        setContext('main');
      } else if (upperCmd === 'R') {
        game.reset();
      } else {
        game.guess(cmd);
      }
    } else if (context === 'board') {
      if (upperCmd === 'P' || upperCmd === 'X' || upperCmd === 'T' || upperCmd === 'TOP') {
        setContext('main');
      } else if (upperCmd === 'K') {
        board.startWrite(null);
        setContext('write');
      } else {
        // 목록 평탄화 순번(1부터)으로 글 선택
        const index = parseInt(cmd, 10);
        if (!Number.isNaN(index) && index >= 1 && index <= board.posts.length) {
          void board.openPost(board.posts[index - 1].id);
          setContext('post');
        } else {
          alert('올바른 글 번호를 입력하세요.');
        }
      }
    } else if (context === 'post') {
      if (upperCmd === 'P' || upperCmd === 'X') {
        setContext('board');
      } else if (upperCmd === 'T' || upperCmd === 'TOP') {
        setContext('main');
      } else if (upperCmd === 'W' || cmd === '답글') {
        if (board.currentPost) {
          board.startWrite(board.currentPost.id);
          setContext('write');
        }
      }
    } else if (context === 'write') {
      void board.submitWriteInput(cmd).then((result) => {
        if (result === 'done') {
          setContext('board');
        }
      });
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
        {context === 'main' && (
          <MainMenu senderName={senderName} activePanel={activePanel} onSelect={handleCommand} />
        )}
        {context === 'chat_menu' && <RoomList rooms={rooms} onEnter={enterChatRoom} />}
        {context === 'chat' && (
          <ChatRoom
            key={currentRoom}
            roomId={currentRoom}
            messages={messages}
            occupantCount={occupantCount}
          />
        )}
        {context === 'arcade' && <Arcade log={game.log} />}
        {context === 'board' && <BoardList posts={board.posts} />}
        {context === 'post' && <PostView post={board.currentPost} />}
        {context === 'write' && (
          <PostWrite stage={board.write.stage} title={board.write.title} isReply={board.write.parentId !== null} />
        )}
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

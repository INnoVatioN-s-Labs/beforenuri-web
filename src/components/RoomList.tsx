import { Button } from '@/components/ui/button';
import { InverseBadge } from '@/components/ui/inverse-badge';
import { Panel } from '@/components/ui/panel';
import { Separator } from '@/components/ui/separator';
import type { RoomResponse } from '@/types';

type RoomListProps = {
  rooms: RoomResponse[];
  onEnter: (roomId: number) => void;
};

/** 대화실 분류 화면. 활성 방을 분류별로 묶어 보여준다. */
export function RoomList({ rooms, onEnter }: RoomListProps) {
  // 분류 노출 순서는 백엔드가 내려준 등장 순서를 그대로 유지한다.
  const categories: { title: string; rooms: RoomResponse[] }[] = [];
  for (const room of rooms) {
    if (!room.active) continue;
    let group = categories.find((c) => c.title === room.category);
    if (!group) {
      group = { title: room.category, rooms: [] };
      categories.push(group);
    }
    group.rooms.push(room);
  }

  return (
    <div className="flex flex-grow flex-col">
      <h2 className="mb-4 mt-0 text-center text-[1.2em] text-terminal-accent">대화실 [분류]</h2>
      {rooms.length === 0 ? (
        <div className="mt-3 text-center text-terminal-dim">대화실 목록을 불러오는 중...</div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {categories.map((category) => (
            <Panel key={category.title} className="flex flex-col">
              <InverseBadge className="mb-3 block w-full px-0 py-0.5 text-center text-[1.1em]">
                {category.title}
              </InverseBadge>
              <div className="flex flex-col gap-1">
                {category.rooms.map((room) => (
                  <div key={room.id} className="whitespace-nowrap">
                    <Button onClick={() => onEnter(room.id)}>
                      {room.code}. {room.title}
                    </Button>
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
      )}
      <Separator />
      <div className="mb-5 text-center text-terminal-dim">
        원하시는 대화방 번호를 입력해주세요. (이전 화면으로 돌아가려면 P 입력)
      </div>
    </div>
  );
}

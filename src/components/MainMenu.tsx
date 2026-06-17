import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const MENU_ITEMS = [
  '1. 공지사항', '11. 자유게시판', '14. 대화실',
  '2. 시삽소개', '12. 유머게시판', '15. 자료실',
  '3. 환경설정', '13. 친구찾아요', '16. 오락실',
];

type MainMenuProps = {
  senderName: string;
  onSelect: (code: string) => void;
};

/** 초기 메인 메뉴 화면. */
export function MainMenu({ senderName, onSelect }: MainMenuProps) {
  return (
    <div className="flex flex-grow flex-col">
      <div className="mx-auto grid w-full grid-cols-2 gap-x-8 gap-y-4 text-[clamp(17px,3vw,22px)] sm:w-[680px] sm:grid-cols-3">
        {MENU_ITEMS.map((item) => (
          <Button key={item} onClick={() => onSelect(item.split('.')[0])}>
            {item}
          </Button>
        ))}
      </div>
      <Separator />
      <div className="mb-5 text-center text-terminal-dim">
        안녕하세요! 새로운 PC통신 시대에 오신 것을 환영합니다.<br />
        대화실 접속을 원하시면 '14' 또는 'GO CHAT'을 입력해주세요.
        {senderName && (
          <>
            <br />
            당신의 닉네임은 <span className="text-terminal-accent">{senderName}</span> 입니다.
          </>
        )}
      </div>
    </div>
  );
}

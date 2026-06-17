import { Button } from '@/components/ui/button';

type ToolsProps = {
  onHelp: () => void;
  onModemSound: () => void;
  onClear: () => void;
};

/** 하단 도구 버튼 영역: 도움말 · 모뎀 접속음 · 초기화. */
export function Tools({ onHelp, onModemSound, onClear }: ToolsProps) {
  return (
    <div className="mt-5 flex justify-center gap-2.5">
      <Button variant="tool" onClick={onHelp}>도움말</Button>
      <Button variant="tool" onClick={onModemSound}>모뎀 접속음 재생</Button>
      <Button variant="tool" onClick={onClear}>초기화</Button>
    </div>
  );
}

import { InverseBadge } from '@/components/ui/inverse-badge';

/** 상단 바: 도메인(역상) · 사이트명 · TOP. */
export function TopBar() {
  return (
    <div className="mb-5 grid grid-cols-[auto_1fr_auto] items-center gap-2.5 border-b-2 border-terminal-border pb-2.5">
      <InverseBadge className="px-2 py-0.5">NOW.NURI.NET</InverseBadge>
      <div className="text-center text-[1.2em] font-bold">나우누리 (NOW NURI)</div>
      <div className="cursor-pointer">TOP</div>
    </div>
  );
}

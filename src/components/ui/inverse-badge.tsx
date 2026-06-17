import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** PC통신 특유의 역상(흰 배경 + 진한 파랑 텍스트) 강조 박스. */
export function InverseBadge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-block border border-terminal-text bg-terminal-text px-4 py-1 font-bold text-terminal-bg',
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

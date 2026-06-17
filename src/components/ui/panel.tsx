import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** 점선 테두리로 구분되는 콘텐츠 패널. */
export function Panel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('border border-dashed border-terminal-text/40 p-3', className)} {...props}>
      {children}
    </div>
  );
}

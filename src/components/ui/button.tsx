import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('cursor-pointer transition-colors', {
  variants: {
    variant: {
      // 메뉴 / 방 목록 항목: 투명 배경, hover 시 노랑 + 밑줄
      menu: 'border-none bg-transparent text-left text-terminal-text hover:text-terminal-accent hover:underline focus:text-terminal-accent focus:underline',
      // 하단 도구 버튼: 테두리 + 보조 배경
      tool: 'border border-terminal-line bg-terminal-bgAlt px-4 py-1 font-mono text-terminal-dim hover:text-terminal-accent',
    },
  },
  defaultVariants: { variant: 'menu' },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export { buttonVariants };

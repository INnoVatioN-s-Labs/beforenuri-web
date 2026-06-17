import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn 표준 클래스 병합 유틸: 조건부 클래스(clsx) + Tailwind 충돌 해소(tailwind-merge). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

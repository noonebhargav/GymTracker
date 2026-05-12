import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalizeWords(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
}

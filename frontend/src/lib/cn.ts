export type ClassValue = string | false | null | undefined;

/** Ghép class có điều kiện (không có clsx/tailwind-merge trong dependencies nên tự viết gọn). */
export function cn(...values: ClassValue[]): string {
  return values
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');
}

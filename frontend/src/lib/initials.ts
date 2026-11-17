/** Chữ cái đầu để hiển thị avatar: chữ đầu của từ đầu và từ cuối (tối đa 2 ký tự, in hoa). */
export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter((word) => word.length > 0);
  const first = words[0];
  const last = words[words.length - 1];
  if (first === undefined || last === undefined) return '?';
  const firstChar = Array.from(first)[0] ?? '';
  if (words.length === 1) return firstChar.toLocaleUpperCase('vi');
  const lastChar = Array.from(last)[0] ?? '';
  return (firstChar + lastChar).toLocaleUpperCase('vi');
}

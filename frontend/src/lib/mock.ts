export type MockMode = 'error' | 'empty' | 'forbidden';

/** `NEXT_PUBLIC_MOCK_FEATURES=catalog,auth` — tính năng nào đang dùng mock. */
export function isMockFeature(feature: string): boolean {
  const raw = process.env.NEXT_PUBLIC_MOCK_FEATURES ?? '';
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .includes(feature);
}

/** Công tắc dev: `?mock=error|empty|forbidden` trên URL để Review đủ trạng thái. */
export function getMockMode(): MockMode | null {
  if (typeof window === 'undefined') return null;
  if (process.env.NODE_ENV === 'production') return null;
  const value = new URLSearchParams(window.location.search).get('mock');
  return value === 'error' || value === 'empty' || value === 'forbidden' ? value : null;
}

/** Độ trễ giả lập 300–600 ms (bằng 0 khi chạy test). */
export function mockDelay(): Promise<void> {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();
  const ms = 300 + Math.floor(Math.random() * 301);
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

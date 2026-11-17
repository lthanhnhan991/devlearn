'use client';

import { useRef, type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Nhãn đọc cho trình đọc màn hình (`aria-label` của tablist). */
  ariaLabel: string;
  /** Tiền tố để sinh id tab/panel; dùng `tabId`/`panelId` ở phía panel. */
  idPrefix: string;
}

export function tabId(idPrefix: string, id: string): string {
  return `${idPrefix}-tab-${id}`;
}

export function panelId(idPrefix: string, id: string): string {
  return `${idPrefix}-panel-${id}`;
}

export function Tabs({ tabs, value, onChange, ariaLabel, idPrefix }: TabsProps) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function moveTo(index: number) {
    const target = tabs[(index + tabs.length) % tabs.length];
    if (target === undefined) return;
    onChange(target.id);
    buttonRefs.current[target.id]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTo(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      moveTo(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      moveTo(tabs.length - 1);
    }
  }

  return (
    <div role="tablist" aria-label={ariaLabel} className="flex gap-3">
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              buttonRefs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={panelId(idPrefix, tab.id)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              'border-b-2 px-2 pb-2 text-base transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-primary',
              selected
                ? 'border-client-primary font-semibold text-foreground'
                : 'border-transparent text-slate-700 hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

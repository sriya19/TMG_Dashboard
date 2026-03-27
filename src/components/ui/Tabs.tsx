"use client";

import { useState, type ReactNode } from "react";
import { clsx } from "clsx";

interface Tab {
  key: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  onChange?: (key: string) => void;
}

export function Tabs({ tabs, defaultTab, className, onChange }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultTab ?? tabs[0]?.key ?? "");

  const handleChange = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <div className={className}>
      {/* Tab headers */}
      <div className="flex border-b border-slate-200 gap-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleChange(tab.key)}
            className={clsx(
              "px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap",
              "focus:outline-none",
              tab.key === activeKey
                ? "text-blue-700"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {tab.key === activeKey && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700 rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-4">{activeTab?.content}</div>
    </div>
  );
}

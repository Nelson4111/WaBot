import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'pill';
}

export function Tabs({ tabs, activeTab, onChange, variant = 'default' }: TabsProps) {
  if (variant === 'pill') {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap border-2 border-black transition-all ${
              activeTab === tab.id
                ? 'bg-[#AADD00] text-black shadow-[2px_2px_0px_#111]'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1 bg-white border-2 border-black rounded-lg p-1 shadow-[2px_2px_0px_#111]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md font-semibold text-sm transition-all ${
            activeTab === tab.id
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {tab.icon && <span>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default Tabs;

// Also export a compound usage with content
interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export function TabPanel({ id, activeTab, children }: TabPanelProps) {
  if (id !== activeTab) return null;
  return <div>{children}</div>;
}

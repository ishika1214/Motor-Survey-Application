'use client';
import React from 'react';
import type { ActiveTab } from '@/types';
import { KP } from '@/lib/constants';
import { ClipboardList, Wrench, Receipt, Printer } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'survey', label: 'Survey Report', icon: <ClipboardList size={16} /> },
    { id: 'assessment', label: 'Assessment Sheet', icon: <Wrench size={16} /> },
    { id: 'bill', label: 'Fee Bill', icon: <Receipt size={16} /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-brand-name">{KP.name}</div>
          <div className="navbar-brand-sub">
            IRDAI: {KP.lic} · Validity Date: {KP.validity}
          </div>
        </div>

        <div className="navbar-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`nav-tab ${activeTab === t.id ? 'active' : ''}`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        <div className="navbar-hint">
          <Printer size={13} style={{ marginRight: '6px' }} />
          <span>Use Export PDF / Print or Ctrl+P for documents</span>
        </div>
      </div>
    </nav>
  );
}

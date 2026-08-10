'use client';
import React, { useState } from 'react';
import type { ActiveTab } from '@/types';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SurveyReport } from '@/components/SurveyReport/SurveyReport';
import { Assessment } from '@/components/Assessment/Assessment';
import { FeeBill } from '@/components/FeeBill/FeeBill';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('survey');

  return (
    <div className="app-wrapper">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'survey' && <SurveyReport />}
        {activeTab === 'assessment' && <Assessment />}
        {activeTab === 'bill' && <FeeBill />}
      </main>

      <Footer />
    </div>
  );
}

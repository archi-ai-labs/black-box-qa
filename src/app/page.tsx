"use client";

import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useTranslation } from '../hooks/useTranslation';
import Header from '../components/layout/Header';
import TestingTab from '../components/testing/TestingTab';
import MemoryTab from '../components/memory/MemoryTab';
import GuideTab from '../components/guide/GuideTab';
import ExtractTab from '../components/extract/ExtractTab';
import '../styles/components.css';

export type TabType = 'testing' | 'memory' | 'guide' | 'extract';

export default function Home() {
  const { t, locale, changeLocale } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('testing');

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        locale={locale} 
        changeLocale={changeLocale} 
        t={t} 
      />
      
      <main className="main-content">
        {activeTab === 'testing' && <TestingTab t={t} locale={locale} />}
        {activeTab === 'memory' && <MemoryTab t={t} />}
        {activeTab === 'guide' && <GuideTab t={t} />}
        {activeTab === 'extract' && <ExtractTab t={t} />}
      </main>
    </div>
  );
}

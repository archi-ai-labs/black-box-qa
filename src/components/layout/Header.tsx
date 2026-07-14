import { Activity, BookOpen, Brain, DownloadCloud } from 'lucide-react';
import { TabType } from '../../app/page';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  locale: 'vi' | 'en';
  changeLocale: (locale: 'vi' | 'en') => void;
  t: (key: string) => any;
}

export default function Header({ activeTab, setActiveTab, locale, changeLocale, t }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="brand-title">QA Agent Dashboard</h1>
      
      <nav className="tab-nav">
        <button
          onClick={() => setActiveTab('testing')}
          className={`tab-btn ${activeTab === 'testing' ? 'active' : ''}`}
        >
          <Activity size={16} />
          {t('tabs.testing')}
        </button>
        <button
          onClick={() => setActiveTab('memory')}
          className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
        >
          <Brain size={16} />
          {t('tabs.memory')}
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          {t('tabs.guide')}
        </button>
        <button
          onClick={() => setActiveTab('extract')}
          className={`tab-btn ${activeTab === 'extract' ? 'active' : ''}`}
        >
          <DownloadCloud size={16} />
          {t('tabs.extract')}
        </button>
      </nav>

      <div className="locale-switcher">
        <button 
          onClick={() => changeLocale('vi')} 
          className={`locale-btn ${locale === 'vi' ? 'active' : ''}`}
        >
          VI
        </button>
        <button 
          onClick={() => changeLocale('en')} 
          className={`locale-btn ${locale === 'en' ? 'active' : ''}`}
        >
          EN
        </button>
      </div>
    </header>
  );
}

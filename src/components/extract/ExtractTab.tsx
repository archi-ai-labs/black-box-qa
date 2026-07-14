import { useState } from 'react';
import toast from 'react-hot-toast';
import { Copy, FileText, ListChecks } from 'lucide-react';
import { PROMPT_CONTEXT, PROMPT_REQUIREMENTS } from '../../lib/prompts';

export default function ExtractTab({ t }: { t: (key: string) => any }) {
  const [activeSubTab, setActiveSubTab] = useState<'context' | 'requirements'>('context');

  const copyToClipboard = () => {
    const text = activeSubTab === 'context' ? PROMPT_CONTEXT : PROMPT_REQUIREMENTS;
    navigator.clipboard.writeText(text);
    toast.success(t('extract.copied'));
  };

  const textToDisplay = activeSubTab === 'context' ? PROMPT_CONTEXT : PROMPT_REQUIREMENTS;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: 'calc(100vh - 150px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.35rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => setActiveSubTab('context')}
            style={{
              background: activeSubTab === 'context' ? 'linear-gradient(to right, #334155, #1e293b)' : 'transparent',
              color: activeSubTab === 'context' ? 'white' : '#94a3b8',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: activeSubTab === 'context' ? 600 : 400
            }}
          >
            <FileText size={16} />
            {t('extract.context')}
          </button>
          <button
            onClick={() => setActiveSubTab('requirements')}
            style={{
              background: activeSubTab === 'requirements' ? 'linear-gradient(to right, #334155, #1e293b)' : 'transparent',
              color: activeSubTab === 'requirements' ? 'white' : '#94a3b8',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: activeSubTab === 'requirements' ? 600 : 400
            }}
          >
            <ListChecks size={16} />
            {t('extract.requirements')}
          </button>
        </div>

        <button 
          onClick={copyToClipboard}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Copy size={16} />
          {t('extract.copyBtn')}
        </button>
      </div>

      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem', overflowY: 'auto' }}>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.6 }}>
          {textToDisplay}
        </pre>
      </div>
    </div>
  );
}

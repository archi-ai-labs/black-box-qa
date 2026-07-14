import { Terminal, Code, Cpu, LineChart } from 'lucide-react';

export default function GuideTab({ t }: { t: (key: string) => any }) {
  return (
    <div className="glass-card">
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center', color: '#f8fafc' }}>
        {t('guide.title')}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Code size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>{t('guide.step1')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{t('guide.step1Desc')}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(129, 140, 248, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Terminal size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>{t('guide.step2')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{t('guide.step2Desc')}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Cpu size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>{t('guide.step3')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{t('guide.step3Desc')}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <LineChart size={24} />
          </div>
          <h3 style={{ fontSize: '1.05rem', color: '#f1f5f9', marginBottom: '0.5rem' }}>{t('guide.step4')}</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>{t('guide.step4Desc')}</p>
        </div>
      </div>
    </div>
  );
}

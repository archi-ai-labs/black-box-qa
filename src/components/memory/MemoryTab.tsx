import { useSharedMemory } from '../../hooks/useSharedMemory';
import { parseSharedMemory, getRules, getPatterns, getChecklist } from '../../lib/utils';
import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

export default function MemoryTab({ t }: { t: (key: string) => any }) {
  const { sharedMemory, loading } = useSharedMemory();
  
  if (loading) return <div className="p-4">{t('common.loading')}</div>;

  const parsedMemory = parseSharedMemory(sharedMemory);
  const rules = getRules(parsedMemory.rules);
  const patterns = getPatterns(parsedMemory.patterns);
  const checklist = getChecklist(parsedMemory.checklist);

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#38bdf8' }}>
          <ShieldAlert size={20} />
          {t('memory.rules')}
        </h2>
        {rules.length === 0 ? <p style={{ color: '#94a3b8' }}>{t('memory.emptyRules')}</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {rules.map((rule, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#f8fafc' }}>{idx + 1}. {rule.title}</h3>
                <ul style={{ marginLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>
                  {rule.content.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#f43f5e' }}>
          <Sparkles size={20} />
          {t('memory.patterns')}
        </h2>
        {patterns.length === 0 ? <p style={{ color: '#94a3b8' }}>{t('memory.emptyPatterns')}</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {patterns.map((cat, idx) => (
              <div key={idx} style={{ background: 'rgba(244, 63, 94, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.1)' }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#fecdd3' }}>{cat.title}</h3>
                <ul style={{ marginLeft: '1.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  {cat.content.map((item, i) => (
                    <li key={i} style={{ marginBottom: '0.25rem' }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#10b981' }}>
          <CheckCircle2 size={20} />
          {t('memory.checklist')}
        </h2>
        {checklist.length === 0 ? <p style={{ color: '#94a3b8' }}>{t('memory.emptyChecklist')}</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
            {checklist.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ marginTop: '0.2rem', color: item.checked ? '#10b981' : '#475569' }}>
                  <CheckCircle2 size={16} />
                </div>
                <span style={{ color: item.checked ? '#cbd5e1' : '#94a3b8', textDecoration: item.checked ? 'line-through' : 'none', fontSize: '0.9rem' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProjects } from '../../hooks/useProjects';
import { useTestStatus } from '../../hooks/useTestStatus';
import { Play } from 'lucide-react';
import { CATALOG_META } from '../../lib/constants';
import { TestCase } from '../../lib/types';

export default function TestingTab({ t, locale }: { t: (key: string) => any, locale: 'vi' | 'en' }) {
  const { projects, loading: projectsLoading } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('project-demo');
  const { data, loading: dataLoading } = useTestStatus(selectedProjectId);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const [triggering, setTriggering] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [autoExpand, setAutoExpand] = useState<boolean>(false);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [waitingList, setWaitingList] = useState<Set<string>>(new Set());
  const [collapsedCatalogs, setCollapsedCatalogs] = useState<Record<string, boolean>>({});

  const handleRunTests = async () => {
    if (!selectedProjectId) {
      toast.error("Vui lòng chọn một dự án trước khi chạy test.");
      return;
    }
    setTriggering(true);
    try {
      const res = await fetch('/api/run-tests', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      if (res.ok) {
        toast.success("Đã bắt đầu chạy test!");
      } else {
        toast.error("Có lỗi khi gọi API test.");
      }
    } catch (error) {
      toast.error("Không thể kết nối đến server.");
    } finally {
      setTriggering(false);
    }
  };

  const handleFilterChange = (filter: 'ALL' | 'PASS' | 'FAIL') => {
    setStatusFilter(filter);
  };

  const handleToggleCatalog = (catalog: string) => {
    setCollapsedCatalogs(prev => ({
      ...prev,
      [catalog]: !prev[catalog]
    }));
  };

  const handleToggleTest = (testName: string) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(testName)) newSet.delete(testName);
      else newSet.add(testName);
      return newSet;
    });
  };

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const activeRun = selectedRunId 
    ? data?.runs?.find(r => r.runId === selectedRunId) 
    : (data?.runs && data.runs.length > 0 ? data.runs[0] : null);

  if (projectsLoading) return <div className="p-4">{t('common.loading')}</div>;

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {data?.runs && data.runs.length > 0 && (
            <select
              value={selectedRunId || data.runs[0].runId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: '4px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {data.runs.map(r => (
                <option key={r.runId} value={r.runId}>
                  Run: {new Date(r.timestamp).toLocaleString()} ({r.status})
                </option>
              ))}
            </select>
          )}
          {currentProject && (
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {t('testing.projectTarget')}: {currentProject.targetUrl}
            </span>
          )}
        </div>
        
        <button 
          onClick={handleRunTests}
          disabled={triggering}
          className="primary-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Play size={16} />
          {triggering ? t('testing.runTestsLoading') : t('testing.runTestsBtn')}
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t('testing.summary.total')}</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data?.summary?.total || 0}</span>
        </div>
        <div className="metric-card">
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>{t('testing.summary.passed')}</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{data?.summary?.passed || 0}</span>
        </div>
        <div className="metric-card">
          <span style={{ fontSize: '0.75rem', color: '#ef4444' }}>{t('testing.summary.failed')}</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{data?.summary?.failed || 0}</span>
        </div>
      </div>

      {/* Render Test Cases */}
      <div style={{ marginTop: '2rem' }}>
        {activeRun && activeRun.testCases && activeRun.testCases.length > 0 && (
          <div style={{ 
            display: 'flex', gap: '0.5rem', alignItems: 'center', 
            background: 'rgba(255, 255, 255, 0.02)', padding: '0.4rem 0.75rem', 
            borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '1rem', flexWrap: 'wrap'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginRight: '0.5rem', textTransform: 'uppercase' }}>
              🔍 {t('testing.filter.all') || "Lọc kết quả:"}
            </span>
            <button 
              onClick={() => handleFilterChange('ALL')}
              style={{
                background: statusFilter === 'ALL' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                color: statusFilter === 'ALL' ? '#38bdf8' : '#94a3b8',
                border: `1px solid ${statusFilter === 'ALL' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              {t('testing.filter.all')} ({activeRun.testCases.length})
            </button>
            <button 
              onClick={() => handleFilterChange('PASS')}
              style={{
                background: statusFilter === 'PASS' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                color: statusFilter === 'PASS' ? '#34d399' : '#94a3b8',
                border: `1px solid ${statusFilter === 'PASS' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              {t('testing.filter.pass')} ({activeRun.testCases.filter(tc => tc.status === 'PASS').length})
            </button>
            <button 
              onClick={() => handleFilterChange('FAIL')}
              style={{
                background: statusFilter === 'FAIL' ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                color: statusFilter === 'FAIL' ? '#f43f5e' : '#94a3b8',
                border: `1px solid ${statusFilter === 'FAIL' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', borderRadius: '6px', cursor: 'pointer'
              }}
            >
              {t('testing.filter.fail')} ({activeRun.testCases.filter(tc => tc.status === 'FAIL').length})
            </button>
            
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={autoExpand}
                onChange={(e) => setAutoExpand(e.target.checked)}
              />
              Tự động mở rộng chi tiết
            </label>
          </div>
        )}

        <div className="test-cases-container">
          {activeRun && activeRun.testCases && activeRun.testCases.length > 0 ? (
            (() => {
              const filtered = activeRun.testCases.filter(tc => statusFilter === 'ALL' || tc.status === statusFilter);
              if (filtered.length === 0) {
                return <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Không có ca kiểm thử nào khớp với bộ lọc.</div>;
              }

              const grouped: Record<string, TestCase[]> = {};
              filtered.forEach(tc => {
                const cat = tc.catalog || 'GENERAL';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(tc);
              });
              
              const catalogOrder = Object.keys(CATALOG_META);
              const sortedCatalogs = Object.keys(grouped).sort((a, b) => {
                let idxA = catalogOrder.indexOf(a); let idxB = catalogOrder.indexOf(b);
                if (idxA === -1) idxA = 999; if (idxB === -1) idxB = 999;
                return idxA - idxB;
              });

              return sortedCatalogs.map(catalogKey => {
                const testsInCatalog = grouped[catalogKey];
                const meta = CATALOG_META[catalogKey] || CATALOG_META['GENERAL'] || { icon: '📁', label: catalogKey };
                const passCount = testsInCatalog.filter(t => t.status === 'PASS').length;
                const totalCount = testsInCatalog.length;
                
                return (
                  <div key={catalogKey} style={{ marginBottom: '1.5rem' }}>
                    <div 
                      onClick={() => handleToggleCatalog(catalogKey)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 1rem', background: 'rgba(30, 41, 59, 0.5)',
                        borderRadius: '8px', marginBottom: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)', cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{meta.label}</span>
                      <span style={{ 
                        marginLeft: 'auto', fontSize: '0.75rem', 
                        background: passCount === totalCount ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        color: passCount === totalCount ? '#34d399' : '#f43f5e',
                        padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700 
                      }}>
                        {passCount}/{totalCount} Pass
                      </span>
                    </div>
                    
                    {!collapsedCatalogs[catalogKey] && (
                      <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '1rem' }}>
                        {testsInCatalog.map((tc, tcIdx) => {
                          const isExpanded = autoExpand || expandedTests.has(tc.name);
                          const hasFailed = tc.status === 'FAIL';
                          const tcIdMatch = tc.name.match(/^(TC_[A-Z0-9_]+)/);
                          const tcId = tcIdMatch ? tcIdMatch[1] : tc.name;
                          const isSelectedForCopy = waitingList.has(tcId);
                          
                          return (
                            <div key={tc.name + tcIdx} className="test-case-item">
                              <div 
                                className="test-case-header" 
                                onClick={() => handleToggleTest(tc.name)}
                                style={{
                                  borderLeft: hasFailed ? '4px solid hsl(var(--color-error))' : '4px solid hsl(var(--color-success))',
                                  background: isExpanded ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 41, 59, 0.15)'
                                }}
                              >
                                <div className="test-case-title-area" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
                                  <span className={`test-case-method method-${tc.request.method.toLowerCase()}`}>
                                    {tc.request.method}
                                  </span>
                                  <span className="test-case-name" style={{ fontSize: '0.875rem' }}>{tc.name}</span>
                                  
                                  {/* Nút Chọn ID */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setWaitingList(prev => {
                                        const newSet = new Set(prev);
                                        if (newSet.has(tcId)) newSet.delete(tcId);
                                        else newSet.add(tcId);
                                        return newSet;
                                      });
                                    }}
                                    style={{
                                      marginLeft: '0.5rem',
                                      padding: '0.15rem 0.5rem',
                                      fontSize: '0.7rem',
                                      borderRadius: '4px',
                                      background: isSelectedForCopy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                      color: isSelectedForCopy ? '#34d399' : '#94a3b8',
                                      border: `1px solid ${isSelectedForCopy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.2rem',
                                      fontWeight: isSelectedForCopy ? 'bold' : 'normal'
                                    }}
                                  >
                                    {isSelectedForCopy ? '✓ Đã chọn ID' : '+ Chọn ID'}
                                  </button>
                                </div>
                                <div className="test-case-meta">
                                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{tc.request.url}</span>
                                  <span className={`badge ${hasFailed ? 'badge-error' : 'badge-success'}`}>
                                    {tc.status}
                                  </span>
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    ▼
                                  </span>
                                </div>
                              </div>
                              
                              {isExpanded && (
                                <div className="test-case-details" style={{ display: 'block' }}>
                                  {tc.errorMsg && (
                                    <div className="error-banner" style={{ marginBottom: '1rem' }}>
                                      {tc.errorMsg}
                                    </div>
                                  )}

                                  {/* ĐIỀU KIỆN PASS BLOCK - LUÔN HIỂN THỊ ĐỂ CẢNH BÁO NẾU THIẾU */}
                                  <div style={{
                                    marginBottom: '1rem',
                                    padding: '0.8rem 1rem',
                                    borderRadius: '8px',
                                    background: tc.passCondition 
                                      ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234, 179, 8, 0.12)' : 'rgba(99, 102, 241, 0.12)')
                                      : 'rgba(244, 63, 94, 0.08)', // Red background for missing condition
                                    border: `1px solid ${tc.passCondition 
                                      ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.5)' : 'rgba(99,102,241,0.5)')
                                      : 'rgba(244, 63, 94, 0.3)'}`,
                                    boxShadow: tc.passCondition 
                                      ? (tc.passCondition.startsWith('[SIMULATED]') ? '0 0 12px rgba(234, 179, 8, 0.15)' : '0 0 12px rgba(99, 102, 241, 0.15)')
                                      : 'none',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '0.75rem',
                                    fontSize: '0.9rem',
                                  }}>
                                    <span 
                                      title={!tc.passCondition 
                                        ? 'Kịch bản test chưa được định nghĩa công thức kiểm tra tính đúng đắn. Cần code lại test script!'
                                        : (tc.passCondition.startsWith('[SIMULATED]') 
                                            ? 'Điều kiện này do hệ thống trích xuất tự động. Cần QA/Dev review lại để đảm bảo chính xác.' 
                                            : 'Điều kiện này đã được QA/Dev viết tay và review cẩn thận, có độ tin cậy tuyệt đối.')}
                                      style={{
                                      flexShrink: 0,
                                      fontWeight: 800,
                                      cursor: 'help',
                                      color: tc.passCondition 
                                        ? (tc.passCondition.startsWith('[SIMULATED]') ? '#facc15' : '#a5b4fc')
                                        : '#f87171',
                                      fontSize: '0.75rem',
                                      padding: '0.2rem 0.6rem',
                                      borderRadius: '6px',
                                      background: tc.passCondition 
                                        ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.2)' : 'rgba(99,102,241,0.2)')
                                        : 'rgba(244, 63, 94, 0.15)',
                                      marginTop: '0.05rem',
                                      border: `1px solid ${tc.passCondition 
                                        ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.4)' : 'rgba(99,102,241,0.4)')
                                        : 'rgba(244, 63, 94, 0.3)'}`
                                    }}>
                                      {!tc.passCondition 
                                        ? '❌ THIẾU ĐIỀU KIỆN PASS' 
                                        : (tc.passCondition.startsWith('[SIMULATED]') ? '⚠ SIMULATED' : '🎯 ĐIỀU KIỆN PASS (KIỂM TRA KỸ)')}
                                    </span>
                                    <span style={{ color: tc.passCondition ? '#e2e8f0' : '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>
                                      {!tc.passCondition 
                                        ? 'Test case này trong file kết quả trả về không chứa mô tả Điều kiện Pass. Vui lòng cập nhật script để bổ sung!'
                                        : (tc.passCondition.startsWith('[SIMULATED]')
                                          ? tc.passCondition.replace('[SIMULATED]', '').trim()
                                          : tc.passCondition)}
                                    </span>
                                  </div>

                                  {/* Image Screenshot (UI Test Specific) */}
                                  {tc.screenshot && (
                                    <div className="detail-section" style={{ marginBottom: '1rem' }}>
                                      <span className="detail-label">📸 Ảnh chụp màn hình (UI Screenshot)</span>
                                      <div style={{ 
                                        marginTop: '0.5rem', 
                                        position: 'relative', 
                                        borderRadius: '8px', 
                                        overflow: 'hidden', 
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        background: '#090d16'
                                      }}>
                                        <img 
                                          src={tc.screenshot} 
                                          alt={tc.name} 
                                          style={{ maxWidth: '100%', display: 'block', height: 'auto', cursor: 'zoom-in', margin: '0 auto' }} 
                                          onClick={() => window.open(tc.screenshot, '_blank')}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  <div className="detail-section" style={{ marginBottom: '1rem' }}>
                                    <span className="detail-label">
                                      {tc.request.method === 'CHECK_UI' || tc.request.method === 'CLICK_ACTION' || tc.request.method === 'NAVIGATE_TABS'
                                        ? 'UI Action / Target'
                                        : 'HTTP Endpoint'}
                                    </span>
                                    <div className="code-block" style={{ color: '#38bdf8' }}>
                                      {tc.request.method} {tc.request.url.startsWith('http') ? tc.request.url : (tc.request.method === 'CHECK_UI' || tc.request.method === 'CLICK_ACTION' || tc.request.method === 'NAVIGATE_TABS' ? tc.request.url : `http://localhost:4000${tc.request.url}`)} (Status: {tc.statusCode})
                                    </div>
                                  </div>
                                  
                                  {tc.request.body && (
                                    <div className="detail-section" style={{ marginBottom: '1rem' }}>
                                      <span className="detail-label">Dữ liệu gửi đi (Request Payload)</span>
                                      <pre className="code-block">
                                        {JSON.stringify(tc.request.body, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {tc.response && tc.response.body && (
                                    <div className="detail-section" style={{ marginBottom: tc.logs && tc.logs.length > 0 ? '1rem' : '0' }}>
                                      <span className="detail-label">Kết quả trả về (Response Body)</span>
                                      <pre className="code-block" style={{ borderColor: hasFailed ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)' }}>
                                        {JSON.stringify(tc.response.body, null, 2)}
                                      </pre>
                                    </div>
                                  )}

                                  {tc.logs && tc.logs.length > 0 && (
                                    <div className="detail-section">
                                      <span className="detail-label">⚠️ Nhật ký lỗi Console / Network (Logs)</span>
                                      <pre className="code-block" style={{ 
                                        maxHeight: '180px', 
                                        overflowY: 'auto', 
                                        background: 'rgba(244, 63, 94, 0.05)', 
                                        color: '#fca5a5', 
                                        borderColor: 'rgba(244, 63, 94, 0.15)',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        whiteSpace: 'pre-wrap'
                                      }}>
                                        {tc.logs.join('\n')}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            })()
          ) : activeRun?.status === 'running' ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
              <div className="pulse-dot" style={{ width: '12px', height: '12px', margin: '0 auto 1rem', display: 'block' }}></div>
              Đang khởi chạy kịch bản kiểm thử...
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
              Chưa có dữ liệu. Hãy bấm "Run Tests now".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

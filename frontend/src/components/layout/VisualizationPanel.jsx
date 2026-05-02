import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const queryTypeColors = {
  SELECT: { color: 'var(--neon-cyan)', bg: 'rgba(0, 243, 255, 0.15)', icon: '⎌' },
  INSERT: { color: 'var(--neon-green)', bg: 'rgba(0, 255, 102, 0.15)', icon: '⎀' },
  UPDATE: { color: 'var(--neon-yellow)', bg: 'rgba(255, 204, 0, 0.15)', icon: '⎋' },
  DELETE: { color: 'var(--neon-red)', bg: 'rgba(255, 42, 42, 0.15)', icon: '⎗' },
  BEGIN: { color: 'var(--neon-blue)', bg: 'rgba(0, 102, 255, 0.15)', icon: '⎘' },
  COMMIT: { color: 'var(--neon-green)', bg: 'rgba(0, 255, 102, 0.15)', icon: '⎓' },
  ROLLBACK: { color: 'var(--neon-red)', bg: 'rgba(255, 42, 42, 0.15)', icon: '⎚' }
};

const FLOW_NODES = [
  '[ INTERFACE_LAYER ]',
  '[ AUTH_GATEWAY ]',
  '[ API_ROUTER ]',
  '[ QUERY_BUILDER ]',
  '[ DB_DRIVER ]',
  '[ SQLITE_CORE_DB ]'
];

function FlowchartAnimation({ flowing, color, step }) {
  return (
    <div className="relative flex flex-col items-center" style={{ margin: '10px 0', padding: '10px 0' }}>
      {FLOW_NODES.map((node, i) => {
        const isPast = flowing && step > i;
        const isCurrent = flowing && step === i;
        const nodeColor = isCurrent ? color : (isPast ? 'var(--text-tertiary)' : 'var(--text-muted)');
        const borderColor = isCurrent ? color : 'var(--border-subtle)';

        return (
          <React.Fragment key={i}>
            <div 
              className="hud-brackets glass" 
              style={{ 
                width: '80%', padding: '6px', textAlign: 'center', 
                borderColor, 
                background: isCurrent ? 'rgba(0, 243, 255, 0.05)' : 'var(--bg-card)',
                transition: 'all 0.3s' 
              }}
            >
              <span className="mono text-xs" style={{ color: nodeColor, fontWeight: isCurrent ? 'bold' : 'normal' }}>
                {node}
              </span>
            </div>

            {i < FLOW_NODES.length - 1 && (
              <div style={{ width: '2px', height: '16px', background: 'var(--border-subtle)', position: 'relative' }}>
                <AnimatePresence>
                  {isCurrent && (
                    <motion.div
                      initial={{ top: 0, opacity: 1 }}
                      animate={{ top: '16px', opacity: 0 }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ position: 'absolute', left: '-4px', width: '10px', height: '10px', background: color, borderRadius: '50%', boxShadow: `0 0 10px ${color}` }}
                    />
                  )}
                </AnimatePresence>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function SQLTypewriter({ sql, color }) {
  const [displayed, setDisplayed] = useState('');
  
  useEffect(() => {
    if (!sql) return;
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(sql.substring(0, i));
      if (i >= sql.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [sql]);

  return (
    <div className="hud-brackets glass" style={{
      padding: '15px', marginTop: '10px', minHeight: '80px',
      border: `1px solid ${color || 'var(--border-medium)'}`,
      position: 'relative', overflow: 'hidden'
    }}>
      <div className="scan-line-overlay" style={{ position: 'absolute', zIndex: 1, opacity: 0.5 }} />
      <div className="mono" style={{ color: color || 'var(--neon-cyan)', fontSize: '0.75rem', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
        {displayed}
        <span style={{ animation: 'blink 1s step-end infinite', borderRight: `2px solid ${color || 'var(--neon-cyan)'}` }}>&nbsp;</span>
      </div>
    </div>
  );
}

function TableNode({ table, active, count, type }) {
  return (
    <motion.div
      animate={{
        background: active ? 'rgba(0, 243, 255, 0.15)' : 'var(--bg-card)',
        borderColor: active ? 'var(--neon-cyan)' : 'var(--border-subtle)',
        scale: active ? 1.05 : 1
      }}
      className="flex justify-between items-center"
      style={{
        padding: '8px 12px', borderRadius: '4px', borderLeft: active ? '4px solid var(--neon-cyan)' : '4px solid var(--border-subtle)',
        marginBottom: '8px', transition: 'all 0.3s'
      }}
    >
      <span className="mono text-xs" style={{ color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{table.toUpperCase()}</span>
      <div className="flex gap-sm items-center">
        {active && type && (
           <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--bg-void)', background: 'var(--neon-cyan)', padding: '2px 6px', borderRadius: '2px' }}>{type}</span>
        )}
        <span className="mono" style={{ color: 'var(--neon-cyan)' }}>{count > 0 ? `[${count}]` : ''}</span>
      </div>
    </motion.div>
  );
}

export default function VisualizationPanel({ socket }) {
  const { operations, latestOp, connected } = socket;
  const [flowing, setFlowing] = useState(false);
  const [step, setStep] = useState(0);
  
  useEffect(() => {
    if (!latestOp) return;
    setFlowing(true);
    setStep(0);

    // 6 steps, 2 seconds each
    const interval = setInterval(() => {
      setStep(s => {
        if (s >= 5) {
          setFlowing(false);
          clearInterval(interval);
          return 0;
        }
        return s + 1;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [latestOp?.id]);

  const opColor = latestOp ? (queryTypeColors[latestOp.queryType]?.color || 'var(--neon-cyan)') : 'var(--border-medium)';
  const tables = ['criminals', 'cases', 'officers', 'evidence', 'case_assignments'];

  return (
    <aside className="viz-panel flex flex-col">
      <div className="scan-line-overlay" style={{ zIndex: 0, opacity: 0.1 }} />
      
      {/* Header */}
      <div className="flex justify-between items-center" style={{ padding: '20px', borderBottom: '1px solid var(--border-medium)', zIndex: 1 }}>
        <div className="flex items-center gap-sm">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} style={{ width: '16px', height: '16px', border: '2px dashed var(--neon-cyan)', borderRadius: '50%' }} />
          <span className="display-text text-lg" style={{ color: 'var(--neon-cyan)', textShadow: 'var(--glow-cyan)' }}>SYS_MONITOR</span>
        </div>
        <div className="flex items-center gap-xs">
          <div style={{ width: '8px', height: '8px', background: flowing ? opColor : 'var(--border-subtle)', borderRadius: '50%', boxShadow: flowing ? `0 0 10px ${opColor}` : 'none' }} />
          <span className="mono text-xs" style={{ color: 'var(--text-secondary)' }}>{flowing ? 'PROCESSING' : 'IDLE'}</span>
        </div>
      </div>

      <div className="flex-col overflow-auto" style={{ padding: '20px', zIndex: 1, flex: 1 }}>
        
        {/* Flowchart Animation */}
        <div className="mono text-xs text-muted" style={{ letterSpacing: '2px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>// DATA_FLOW_DIAGRAM</div>
        <FlowchartAnimation flowing={flowing} color={opColor} step={step} />

        {/* SQL Monitor */}
        <div style={{ marginTop: '20px' }}>
          <div className="mono text-xs text-muted" style={{ letterSpacing: '2px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px' }}>// LAST_EXECUTION_LOG</div>
          <SQLTypewriter sql={latestOp?.sql} color={opColor} />
          <div className="flex justify-between mono text-xs mt-2" style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span>T:{latestOp?.duration || 0}ms</span>
            <span>ROWS:{latestOp?.rowCount ?? '-'}</span>
          </div>
        </div>

        {/* Table Activity */}
        <div style={{ marginTop: '30px' }}>
           <div className="mono text-xs text-muted" style={{ letterSpacing: '2px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '5px', marginBottom: '10px' }}>// DATA_NODES</div>
           {tables.map(t => (
             <TableNode 
               key={t} 
               table={t} 
               active={latestOp?.table === t} 
               count={operations.filter(o => o.table === t).length} 
               type={latestOp?.table === t ? latestOp?.queryType : null}
             />
           ))}
        </div>
      </div>
    </aside>
  );
}

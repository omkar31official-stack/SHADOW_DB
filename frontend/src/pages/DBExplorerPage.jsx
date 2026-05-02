import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation } from '../hooks/useApi';
import api from '../utils/api';

const EXAMPLE_QUERIES = [
  { label: 'All Criminals', sql: 'SELECT * FROM criminals;' },
  { label: 'Wanted Only', sql: "SELECT first_name, last_name, alias, danger_level FROM criminals WHERE status = 'wanted';" },
  { label: 'Cases with JOIN', sql: 'SELECT c.case_number, c.title, cr.first_name, cr.last_name, ca.role\nFROM cases c\nJOIN case_assignments ca ON c.id = ca.case_id\nJOIN criminals cr ON ca.criminal_id = cr.id;' },
  { label: 'Evidence Count', sql: 'SELECT c.case_number, c.title, COUNT(e.id) as evidence_count\nFROM cases c\nLEFT JOIN evidence e ON c.id = e.case_id\nGROUP BY c.id;' },
  { label: 'Crime Stats', sql: "SELECT crime_type, COUNT(*) as total, \n  SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_cases\nFROM cases\nGROUP BY crime_type\nORDER BY total DESC;" },
  { label: 'Officer Workload', sql: 'SELECT o.badge_number, o.first_name, o.last_name, COUNT(ca.id) as assignments\nFROM officers o\nLEFT JOIN case_assignments ca ON o.id = ca.officer_id\nGROUP BY o.id\nORDER BY assignments DESC;' },
];

const keywordColors = {
  SELECT: '#00b8ff', FROM: '#a855f7', WHERE: '#ff6d00', JOIN: '#00ffd5',
  'LEFT JOIN': '#00ffd5', 'RIGHT JOIN': '#00ffd5', 'INNER JOIN': '#00ffd5',
  ON: '#ffd740', AND: '#ff1744', OR: '#ff1744', INSERT: '#00e676',
  INTO: '#00e676', UPDATE: '#ffd740', DELETE: '#ff1744', SET: '#ffd740',
  'GROUP BY': '#a855f7', 'ORDER BY': '#a855f7', COUNT: '#00b8ff',
  SUM: '#00b8ff', AVG: '#00b8ff', AS: '#8888a8', CASE: '#ff6d00',
  WHEN: '#ff6d00', THEN: '#ff6d00', ELSE: '#ff6d00', END: '#ff6d00',
  DESC: '#8888a8', ASC: '#8888a8', LIMIT: '#a855f7',
};

function highlightSQL(sql) {
  if (!sql) return '';
  let result = sql;
  Object.entries(keywordColors).forEach(([kw, color]) => {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    result = result.replace(regex, `<span style="color:${color};font-weight:700">${kw}</span>`);
  });
  // Highlight strings
  result = result.replace(/'([^']*)'/g, '<span style="color:#00e676">\'$1\'</span>');
  return result;
}

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

import PasswordPrompt from '../components/PasswordPrompt';

export default function DBExplorerPage() {
  const [query, setQuery] = useState('SELECT * FROM criminals LIMIT 10;');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('query');
  const [schema, setSchema] = useState(null);
  const { mutate, loading } = useMutation();
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  const executeQuery = () => {
    if (/(delete|drop|remove)\s/i.test(query)) {
      setShowPasswordPrompt(true);
      return;
    }
    performExecution();
  };

  const performExecution = async () => {
    setError(null);
    setResults(null);
    setShowPasswordPrompt(false);
    try {
      const res = await api.post('/db/execute-query', { sql: query });
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadSchema = async () => {
    try {
      const res = await api.get('/db/schema');
      setSchema(res.data || res);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === 'schema' && !schema) loadSchema();
  };

  const runTransaction = async (shouldFail) => {
    setError(null);
    setResults(null);
    try {
      const res = await api.post('/db/transaction-demo', { shouldFail });
      setResults(res);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence>
        {showPasswordPrompt && (
          <PasswordPrompt 
            onConfirm={performExecution} 
            onCancel={() => setShowPasswordPrompt(false)} 
          />
        )}
      </AnimatePresence>

      <div className="page-header">
        <motion.h1 
          className="page-title"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          <span style={{ color: 'var(--neon-yellow)', textShadow: '0 0 10px rgba(255, 215, 64, 0.5)' }}>💾 DB Explorer</span>
        </motion.h1>
        <motion.p 
          className="page-subtitle"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Execute queries, explore schema, demonstrate transactions
        </motion.p>
      </div>

      {/* Tabs */}
      <motion.div 
        className="tabs"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ position: 'relative' }}
      >
        {[['query', '⌨️ Query'], ['schema', '📋 Schema'], ['transaction', '🔒 Transactions']].map(([key, label]) => (
          <button 
            key={key} 
            className={`tab ${tab === key ? 'active' : ''}`} 
            onClick={() => handleTabChange(key)}
            style={{ position: 'relative' }}
          >
            {tab === key && (
              <motion.div
                layoutId="active-tab"
                style={{ position: 'absolute', bottom: '-2px', left: 0, right: 0, height: '2px', background: 'var(--neon-blue)', boxShadow: '0 0 8px var(--neon-blue-glow)' }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'query' && (
          <motion.div key="query" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            {/* Example Queries */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
              {EXAMPLE_QUERIES.map((eq, i) => (
                <motion.button 
                  key={eq.label} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 + 0.1 }}
                  whileHover={{ scale: 1.05, background: 'rgba(0,184,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-btn neon-btn-ghost neon-btn-sm"
                  onClick={() => setQuery(eq.sql)}
                >
                  {eq.label}
                </motion.button>
              ))}
            </div>

            {/* Editor */}
            <motion.div 
              className="glass-card" 
              style={{ padding: 0, overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)' }}
            >
              <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--neon-blue)' }}>⚡</span> SQL EDITOR
                </span>
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-blue-glow)' }}
                  whileTap={{ scale: 0.95 }}
                  className="neon-btn neon-btn-primary neon-btn-sm" 
                  onClick={executeQuery} 
                  disabled={loading}
                >
                  {loading ? '⏳ Running...' : '▶ Execute'}
                </motion.button>
              </div>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.ctrlKey && e.key === 'Enter') executeQuery(); }}
                style={{
                  width: '100%', minHeight: '180px', padding: '16px',
                  background: 'var(--bg-void)', color: 'var(--neon-cyan)',
                  fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
                  lineHeight: 1.8, border: 'none', resize: 'vertical',
                }}
                spellCheck={false}
                placeholder="Type your SQL query here... (Ctrl+Enter to execute)"
              />
            </motion.div>
          </motion.div>
        )}

        {tab === 'schema' && (
          <motion.div key="schema" variants={tabVariants} initial="hidden" animate="visible" exit="exit">
            {schema ? (
              <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
                {(Array.isArray(schema) ? schema : []).map((table, i) => (
                  <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, type: 'spring' }}
                    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}
                  >
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--neon-blue)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ opacity: 0.8 }}>📋</span> {table.table_name || table.TABLE_NAME || `Table ${i}`}
                    </h3>
                    <table className="data-table" style={{ fontSize: '0.8rem' }}>
                      <thead><tr><th>Column</th><th>Type</th><th>Key</th><th>Null</th></tr></thead>
                      <tbody>
                        {(table.columns || []).map((col, j) => (
                          <tr key={j}>
                            <td style={{ fontFamily: 'var(--font-mono)', color: col.COLUMN_KEY === 'PRI' ? 'var(--neon-yellow)' : col.COLUMN_KEY === 'MUL' ? 'var(--neon-cyan)' : 'var(--text-primary)' }}>
                              {col.COLUMN_KEY === 'PRI' && '🔑 '}{col.COLUMN_KEY === 'MUL' && '🔗 '}{col.COLUMN_NAME}
                            </td>
                            <td style={{ color: 'var(--text-secondary)' }}>{col.COLUMN_TYPE}</td>
                            <td>{col.COLUMN_KEY || '—'}</td>
                            <td style={{ color: col.IS_NULLABLE === 'YES' ? 'var(--text-muted)' : 'var(--neon-yellow)' }}>{col.IS_NULLABLE}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="glass-card empty-state">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '2rem', marginBottom: '10px' }}>⚙️</motion.div>
                <div className="empty-state-text">Loading schema...</div>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'transaction' && (
          <motion.div key="transaction" variants={tabVariants} initial="hidden" animate="visible" exit="exit" className="glass-card" style={{ borderTop: '3px solid var(--neon-yellow)' }}>
            <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--neon-yellow)' }}>🔒</span> Transaction Demo (COMMIT / ROLLBACK)
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--space-lg)', lineHeight: 1.6, maxWidth: '800px' }}>
              Demonstrates ACID transaction properties. Click "Successful" to see a COMMIT, or "Fail" to trigger a ROLLBACK.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-green-glow)' }}
                whileTap={{ scale: 0.95 }}
                className="neon-btn neon-btn-primary" 
                style={{ background: 'rgba(0,230,118,0.1)', borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
                onClick={() => runTransaction(false)} disabled={loading}
              >
                ✅ Successful Transaction (COMMIT)
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-red-glow)' }}
                whileTap={{ scale: 0.95 }}
                className="neon-btn neon-btn-danger" 
                onClick={() => runTransaction(true)} disabled={loading}
              >
                ❌ Failed Transaction (ROLLBACK)
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {error && (
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }} style={{ marginTop: 'var(--space-md)', borderLeft: '4px solid var(--neon-red)' }}>
            <div style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span> Error: {error}
            </div>
          </motion.div>
        )}

        {results && (
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ type: 'spring' }} style={{ marginTop: 'var(--space-md)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--neon-blue)' }}>📊</span> Results
              </h3>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--neon-cyan)', background: 'rgba(0,184,255,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                {results.event?.duration}ms • {results.event?.rowCount} rows
              </span>
            </div>
            {Array.isArray(results.data) && results.data.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead style={{ background: 'rgba(0,0,0,0.3)' }}><tr>{Object.keys(results.data[0]).map(k => <th key={k}>{k}</th>)}</tr></thead>
                  <tbody>
                    {results.data.slice(0, 100).map((row, i) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                        {Object.values(row).map((v, j) => (
                          <td key={j} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                            {v === null ? <span style={{ color: 'var(--text-muted)' }}>NULL</span> : String(v).substring(0, 100)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--neon-green)', padding: '12px', background: 'rgba(0,230,118,0.1)', borderRadius: '8px' }}>
                {results.message || '✅ Query executed successfully'}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

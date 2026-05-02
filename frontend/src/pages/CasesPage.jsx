import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useMutation } from '../hooks/useApi';
import api from '../utils/api';
import PasswordPrompt from '../components/PasswordPrompt';
import HoloTerminal from '../components/HoloTerminal';

const priorityColors = { 
  low: { primary: 'var(--danger-low)', dim: 'rgba(0, 255, 102, 0.15)', glow: 'rgba(0, 255, 102, 0.4)' },
  medium: { primary: 'var(--danger-medium)', dim: 'rgba(255, 204, 0, 0.15)', glow: 'rgba(255, 204, 0, 0.4)' },
  high: { primary: 'var(--danger-high)', dim: 'rgba(255, 102, 0, 0.15)', glow: 'rgba(255, 102, 0, 0.4)' },
  critical: { primary: 'var(--danger-critical)', dim: 'rgba(255, 42, 42, 0.15)', glow: 'rgba(255, 42, 42, 0.4)' }
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  hover: { y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

function CaseModal({ caseItem, onClose, onSaved }) {
  const [form, setForm] = useState(caseItem || {
    case_number: '', title: '', description: '', crime_type: '',
    status: 'open', priority: 'medium', location: '', occurred_at: '',
  });
  const { mutate, loading } = useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (caseItem?.id) await mutate('put', `/cases/${caseItem.id}`, form);
      else await mutate('post', '/cases', form);
      onSaved();
    } catch (err) { /* handled */ }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ borderTop: `3px solid var(--neon-blue)` }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{caseItem ? '✏️' : '📂'}</span>
            <h2 className="modal-title">{caseItem ? 'Edit Case File' : 'New Case File'}</h2>
          </div>
          <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="modal-close" onClick={onClose}>✕</motion.button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Case Number *</label>
              <input className="form-input" value={form.case_number} onChange={set('case_number')} required placeholder="CASE-2024-001" />
            </div>
            <div className="form-group">
              <label className="form-label">Crime Type *</label>
              <input className="form-input" value={form.crime_type} onChange={set('crime_type')} required placeholder="Robbery, Fraud..." />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={set('status')}>
                <option value="open">Open</option><option value="investigating">Investigating</option>
                <option value="closed">Closed</option><option value="cold">Cold</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" value={form.priority} onChange={set('priority')}>
                <option value="low">Low</option><option value="medium">Medium</option>
                <option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-input" value={form.location} onChange={set('location')} />
            </div>
            <div className="form-group">
              <label className="form-label">Occurred At</label>
              <input className="form-input" type="datetime-local" value={form.occurred_at?.split('.')[0] || ''} onChange={set('occurred_at')} />
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description || ''} onChange={set('description')} rows={3} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="neon-btn neon-btn-ghost" onClick={onClose}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-blue-glow)' }} whileTap={{ scale: 0.95 }} type="submit" className="neon-btn neon-btn-primary" disabled={loading}>
              {loading ? '⏳ Saving...' : caseItem ? '💾 Update' : '📂 Create'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function CasesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [holoView, setHoloView] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const { data, loading, refetch } = useApi(`/cases?search=${search}&status=${statusFilter}`);
  const cases = data?.data || [];

  const triggerDelete = (id, name, e) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await api.delete(`/cases/${deleteTarget.id}`); 
      setDeleteTarget(null);
      refetch(); 
    }
    catch (err) { alert(err.message); setDeleteTarget(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-blue)', boxShadow: '0 0 15px var(--neon-blue)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '6px' }}>
              ACTIVE_<span style={{ color: 'var(--neon-blue)' }}>INVESTIGATIONS</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              SECURED CASE FILES // REAL-TIME MONITORING
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="toolbar"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: '40px' }}
      >
        <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <span className="search-bar-icon">🔍</span>
          <input placeholder="Search cases by title or number..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: '150px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="open">Open</option><option value="investigating">Investigating</option>
          <option value="closed">Closed</option><option value="cold">Cold</option>
        </select>
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--neon-blue)' }}
          whileTap={{ scale: 0.95 }}
          className="neon-btn neon-btn-primary" 
          onClick={() => setModal('add')}
          style={{ padding: '12px 24px' }}
        >
          <span style={{ fontSize: '1.2rem' }}>📂</span> NEW_CASE_FILE
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid-3">{[1,2,3,4,5,6].map(i => <div key={i} className="shimmer glass-card" style={{ height: '220px' }} />)}</div>
      ) : cases.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="empty-state glass-card"
          style={{ height: '300px' }}
        >
          <motion.div 
            animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}
            className="empty-state-icon" style={{ fontSize: '4rem' }}
          >📁</motion.div>
          <div className="display-text" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '20px' }}>NO_CASES_FOUND</div>
        </motion.div>
      ) : (
        <motion.div className="grid-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {cases.map((c) => {
              const theme = priorityColors[c.priority] || priorityColors.medium;
              return (
                <motion.div 
                  key={c.id} 
                  className="glass-card interactive" 
                  variants={cardVariants}
                  whileHover="hover"
                  style={{ 
                    cursor: 'pointer', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    height: '240px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '24px',
                    borderLeft: `2px solid ${theme.primary}`,
                    background: 'rgba(2, 11, 20, 0.6)'
                  }}
                  onClick={() => setHoloView(c)}
                >
                  {/* HUD Corner Decorators */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRight: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', fontWeight: 800, letterSpacing: '1px' }}>{c.case_number}</div>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px' }}>UNIX_REF: {c.id.toString().padStart(5, '0')}</div>
                    </div>
                    <span className={`status-badge ${c.status}`} style={{ boxShadow: `0 0 10px rgba(0,0,0,0.3)`, border: '1px solid rgba(255,255,255,0.1)' }}>{(c.status || '').toUpperCase()}</span>
                  </div>

                  <h3 className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '12px', lineHeight: 1.4, flex: 1 }}>{c.title}</h3>

                  <div style={{ marginTop: 'auto' }}>
                    <div className="flex justify-between items-end">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="mono" style={{ 
                            fontSize: '0.65rem', padding: '3px 10px', borderRadius: '2px',
                            background: theme.dim, color: theme.primary,
                            fontWeight: 800, textTransform: 'uppercase', border: `1px solid ${theme.primary}50`
                          }}>{(c.priority || '').toUpperCase()}</span>
                          <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>// {(c.crime_type || '').toUpperCase()}</span>
                        </div>
                        {c.location && (
                          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--neon-cyan)', opacity: 0.7 }}>📍</span> {(c.location || '').toUpperCase()}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                        <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px' }} onClick={() => setModal(c)}>✏️</motion.button>
                        <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,42,42,0.1)', color: 'var(--neon-red)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px', color: 'var(--text-muted)' }}
                          onClick={(e) => triggerDelete(c.id, c.title, e)}>🗑️</motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom HUD bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: 'var(--neon-blue)', boxShadow: '0 0 10px var(--neon-blue)' }}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {deleteTarget && (
          <PasswordPrompt 
            onConfirm={confirmDelete} 
            onCancel={() => setDeleteTarget(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {holoView && <HoloTerminal type="case" data={holoView} onClose={() => setHoloView(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <CaseModal caseItem={modal !== 'add' ? modal : null}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); refetch(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}

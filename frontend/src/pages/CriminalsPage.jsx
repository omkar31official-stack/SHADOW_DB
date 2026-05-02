import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useMutation } from '../hooks/useApi';
import api from '../utils/api';
import HoloBoard from '../components/HoloBoard';
import PasswordPrompt from '../components/PasswordPrompt';

const dangerColors = { 
  low: { primary: 'var(--danger-low)', dim: 'rgba(0, 255, 102, 0.15)', glow: 'rgba(0, 255, 102, 0.4)' },
  medium: { primary: 'var(--danger-medium)', dim: 'rgba(255, 204, 0, 0.15)', glow: 'rgba(255, 204, 0, 0.4)' },
  high: { primary: 'var(--danger-high)', dim: 'rgba(255, 102, 0, 0.15)', glow: 'rgba(255, 102, 0, 0.4)' },
  critical: { primary: 'var(--danger-critical)', dim: 'rgba(255, 42, 42, 0.15)', glow: 'rgba(255, 42, 42, 0.4)' }
};
const dangerIcons = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' };

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  hover: { y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

function CriminalModal({ criminal, onClose, onSaved }) {
  const [form, setForm] = useState(criminal || {
    first_name: '', last_name: '', alias: '',
    gender: 'Male', nationality: '',
    status: 'wanted', danger_level: 'medium',
  });
  const { mutate, loading } = useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (criminal?.id) await mutate('put', `/criminals/${criminal.id}`, form);
      else await mutate('post', '/criminals', form);
      onSaved();
    } catch (err) { /* handled */ }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div className="modal-content" onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{ borderTop: '3px solid var(--neon-red)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{criminal ? '✏️' : '👤'}</span>
            <h2 className="modal-title">{criminal ? 'Update Intelligence' : 'New Target Entry'}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.first_name} onChange={set('first_name')} required placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.last_name} onChange={set('last_name')} required placeholder="Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Alias</label>
              <input className="form-input" value={form.alias || ''} onChange={set('alias')} placeholder="The Shadow" />
            </div>
            <div className="form-group">
              <label className="form-label">Nationality</label>
              <input className="form-input" value={form.nationality || ''} onChange={set('nationality')} placeholder="American" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={set('status')}>
                <option value="wanted">🔴 Wanted</option>
                <option value="arrested">🟠 Arrested</option>
                <option value="released">🟢 Released</option>
                <option value="deceased">⚫ Deceased</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Danger Level</label>
              <select className="form-select" value={form.danger_level} onChange={set('danger_level')}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <button type="button" className="neon-btn neon-btn-ghost" onClick={onClose}>Cancel</button>
            <motion.button
              type="submit" className="neon-btn neon-btn-primary" disabled={loading}
              whileHover={{ scale: 1.03, boxShadow: '0 0 15px var(--neon-red-glow)' }} 
              style={{ borderColor: 'var(--neon-red)', color: 'var(--neon-red)', background: 'rgba(255,42,42,0.1)' }}
            >
              {loading ? '⏳ PROCESSING...' : criminal ? '💾 UPDATE_INTEL' : '➕ CREATE_TARGET'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function CriminalsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dangerFilter, setDangerFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [holoView, setHoloView] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [deleteTarget, setDeleteTarget] = useState(null); 

  const { data, loading, refetch } = useApi(
    `/criminals?search=${search}&status=${statusFilter}&danger_level=${dangerFilter}`
  );
  const criminals = data?.data || [];

  const triggerDelete = (id, name, e) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await api.delete(`/criminals/${deleteTarget.id}`); 
      setDeleteTarget(null);
      refetch(); 
    }
    catch (err) { alert(err.message); setDeleteTarget(null); }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100%', padding: '0 10px' }}>
      <AnimatePresence>
        {deleteTarget && (
          <PasswordPrompt onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {holoView && <HoloBoard criminal={holoView} onClose={() => setHoloView(null)} />}
      </AnimatePresence>

      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-red)', boxShadow: '0 0 15px var(--neon-red)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '6px' }}>
              CRIMINAL_<span style={{ color: 'var(--neon-red)' }}>DATABASE</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              PERSONNEL TRACKING HUD // REAL-TIME RECOGNITION
            </p>
          </div>
        </motion.div>
      </div>

      <motion.div className="toolbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: '40px' }}>
        <div className="search-bar" style={{ flex: 1, maxWidth: '360px' }}>
          <span className="search-bar-icon">🔍</span>
          <input placeholder="Search by name, alias..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: '130px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="wanted">Wanted</option><option value="arrested">Arrested</option>
          <option value="released">Released</option><option value="deceased">Deceased</option>
        </select>
        <select className="form-select" style={{ width: '130px' }} value={dangerFilter} onChange={(e) => setDangerFilter(e.target.value)}>
          <option value="">All Danger</option>
          <option value="low">Low</option><option value="medium">Medium</option>
          <option value="high">High</option><option value="critical">Critical</option>
        </select>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
          <button className={`tab ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>☰</button>
          <button className={`tab ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>⊞</button>
        </div>
        <motion.button
          className="neon-btn neon-btn-primary" onClick={() => setModal('add')}
          whileHover={{ scale: 1.04, boxShadow: '0 0 20px var(--neon-cyan)' }}
          style={{ padding: '12px 24px' }}
        >➕ ADD_TARGET</motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div key="table" className="data-table-container" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            <table className="data-table">
              <thead><tr>
                <th>ID</th><th>NAME</th><th>ALIAS</th><th>STATUS</th><th>DANGER</th><th>NATIONALITY</th><th>ACTIONS</th>
              </tr></thead>
              <tbody>
                {criminals.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => setHoloView(c)} style={{ cursor: 'pointer' }}
                  >
                    <td className="mono" style={{ color: 'var(--text-tertiary)' }}>#{c.id.toString().padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{(c.first_name || '').toUpperCase()} {(c.last_name || '').toUpperCase()}</td>
                    <td className="mono" style={{ color: 'var(--neon-cyan)', fontSize: '0.8rem' }}>{c.alias || '—'}</td>
                    <td><span className={`status-badge ${c.status}`}>{(c.status || '').toUpperCase()}</span></td>
                    <td><span className={`danger-badge ${c.danger_level}`}>{dangerIcons[c.danger_level]} {(c.danger_level || '').toUpperCase()}</span></td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{c.nationality || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <motion.button className="neon-btn neon-btn-ghost neon-btn-sm" whileHover={{ scale: 1.1 }} onClick={() => setModal(c)}>✏️</motion.button>
                        <motion.button className="neon-btn neon-btn-ghost neon-btn-sm" whileHover={{ scale: 1.1, color: 'var(--neon-red)' }} style={{ color: 'var(--text-muted)' }}
                          onClick={(e) => triggerDelete(c.id, c.first_name, e)}>🗑️</motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        ) : (
          <motion.div key="grid" className="grid-3" variants={stagger} initial="initial" animate="animate">
            {criminals.map((c, i) => {
              const theme = dangerColors[c.danger_level] || dangerColors.medium;
              return (
                <motion.div
                  key={c.id} 
                  className="glass-card interactive"
                  onClick={() => setHoloView(c)}
                  variants={cardVariants}
                  whileHover="hover"
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.4}
                  whileDrag={{ scale: 1.05, zIndex: 100, boxShadow: `0 15px 40px ${theme.primary}40` }}
                  style={{ 
                    cursor: 'grab', 
                    borderLeft: `3px solid ${theme.primary}`, 
                    position: 'relative',
                    height: '220px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'rgba(2, 11, 20, 0.6)'
                  }}
                >
                  <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRight: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span className={`status-badge ${c.status}`} style={{ boxShadow: `0 0 10px rgba(0,0,0,0.3)` }}>{(c.status || '').toUpperCase()}</span>
                    <span className={`danger-badge ${c.danger_level}`} style={{ border: `1px solid ${theme.primary}50`, background: theme.dim, color: theme.primary }}>
                      {dangerIcons[c.danger_level]} {(c.danger_level || '').toUpperCase()}
                    </span>
                  </div>

                  <h3 className="display-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{c.first_name} {c.last_name}</h3>
                  {c.alias && <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--neon-cyan)', fontStyle: 'italic', marginBottom: '8px' }}>// "{c.alias}"</div>}
                  
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      NAT: {c.nationality || 'UNKNOWN'}<br />
                      UID: {c.id.toString().padStart(6, '0')}
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                      <motion.button className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px' }} whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }} onClick={() => setModal(c)}>✏️</motion.button>
                      <motion.button className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px', color: 'var(--text-muted)' }} whileHover={{ scale: 1.1, background: 'rgba(255,42,42,0.1)', color: 'var(--neon-red)' }}
                        onClick={(e) => triggerDelete(c.id, c.first_name, e)}>🗑️</motion.button>
                    </div>
                  </div>

                  {/* Iron Man Drag Handle Decorator */}
                  <div style={{ position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)', width: '24px', height: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                  
                  {/* Bottom HUD bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: theme.primary, boxShadow: `0 0 10px ${theme.primary}` }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <CriminalModal criminal={modal !== 'add' ? modal : null}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); refetch(); }} />}
      </AnimatePresence>
    </div>
  );
}

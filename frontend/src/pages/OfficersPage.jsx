import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useMutation } from '../hooks/useApi';
import api from '../utils/api';
import PasswordPrompt from '../components/PasswordPrompt';
import HoloTerminal from '../components/HoloTerminal';

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  hover: { y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

function OfficerModal({ officer, onClose, onSaved }) {
  const [form, setForm] = useState(officer || {
    badge_number: '', first_name: '', last_name: '',
    rank: 'Officer', department: 'Patrol', status: 'active'
  });
  const { mutate, loading } = useMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (officer?.id) await mutate('put', `/officers/${officer.id}`, form);
      else await mutate('post', '/officers', form);
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
        style={{ borderTop: '3px solid var(--neon-cyan)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{officer ? '✏️' : '🛡️'}</span>
            <h2 className="modal-title">{officer ? 'Update Personnel' : 'Enlist Officer'}</h2>
          </div>
          <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="modal-close" onClick={onClose}>✕</motion.button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Badge Number *</label>
              <input className="form-input" value={form.badge_number} onChange={set('badge_number')} required placeholder="B-12345" />
            </div>
            <div className="form-group">
              <label className="form-label">Rank</label>
              <select className="form-select" value={form.rank} onChange={set('rank')}>
                <option value="Officer">Officer</option><option value="Detective">Detective</option>
                <option value="Sergeant">Sergeant</option><option value="Lieutenant">Lieutenant</option>
                <option value="Captain">Captain</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-input" value={form.first_name} onChange={set('first_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-input" value={form.last_name} onChange={set('last_name')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" value={form.department} onChange={set('department')} />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={set('status')}>
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="retired">Retired</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="neon-btn neon-btn-ghost" onClick={onClose}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-cyan-glow)' }} whileTap={{ scale: 0.95 }} type="submit" className="neon-btn neon-btn-primary" disabled={loading}>
              {loading ? '⏳ SAVING...' : officer ? '💾 UPDATE_FILE' : '➕ ENLIST_OFFICER'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function OfficersPage() {
  const [modal, setModal] = useState(null);
  const [holoView, setHoloView] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, refetch } = useApi('/officers');
  const officers = data?.data || [];

  const triggerDelete = (id, name, e) => {
    e.stopPropagation();
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await api.delete(`/officers/${deleteTarget.id}`); 
      setDeleteTarget(null);
      refetch(); 
    }
    catch (err) { alert(err.message); setDeleteTarget(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-cyan)', boxShadow: '0 0 15px var(--neon-cyan)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '6px' }}>
              PERSONNEL_<span style={{ color: 'var(--neon-cyan)' }}>DIRECTORY</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              AUTHORIZED LAW ENFORCEMENT HUD // ROSTER MANAGEMENT
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
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--neon-cyan)' }}
          whileTap={{ scale: 0.95 }}
          className="neon-btn neon-btn-primary"
          style={{ padding: '12px 24px' }}
          onClick={() => setModal('add')}
        >
          <span style={{ fontSize: '1.2rem' }}>🛡️</span> ENLIST_NEW_OFFICER
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer glass-card" style={{ height: '220px' }} />)}</div>
      ) : officers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="empty-state glass-card"
          style={{ height: '300px' }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 4, repeat: Infinity }}
            className="empty-state-icon" style={{ fontSize: '4rem' }}
          >👤</motion.div>
          <div className="display-text" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '20px' }}>NO_PERSONNEL_FOUND</div>
        </motion.div>
      ) : (
        <motion.div className="grid-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {officers.map((o) => (
              <motion.div
                key={o.id}
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
                  borderLeft: '2px solid var(--neon-cyan)',
                  background: 'rgba(2, 11, 20, 0.6)'
                }}
                onClick={() => setHoloView(o)}
              >
                {/* HUD Corner Decorators */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRight: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '12px',
                    background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.8rem', boxShadow: '0 0 15px rgba(0, 243, 255, 0.2)'
                  }}>
                    🛡️
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: 800, letterSpacing: '1px' }}>{o.badge_number}</div>
                    <span className={`status-badge ${o.status}`} style={{ marginTop: '6px', fontSize: '0.6rem' }}>{(o.status || '').toUpperCase()}</span>
                  </div>
                </div>

                <h3 className="display-text" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                  {o.first_name} {o.last_name}
                </h3>
                <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>
                  // {(o.rank || '').toUpperCase()}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                    DEPT: {(o.department || '').toUpperCase()}<br />
                    REF: PRSN_{o.id.toString().padStart(4, '0')}
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                    <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px' }} onClick={() => setModal(o)}>✏️</motion.button>
                    <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,42,42,0.1)', color: 'var(--neon-red)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px', color: 'var(--text-muted)' }}
                      onClick={(e) => triggerDelete(o.id, `${o.first_name} ${o.last_name}`, e)}>🗑️</motion.button>
                  </div>
                </div>

                {/* Bottom HUD bar */}
                <motion.div 
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: 'var(--neon-cyan)', boxShadow: '0 0 10px var(--neon-cyan)' }}
                />
              </motion.div>
            ))}
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
        {holoView && <HoloTerminal type="officer" data={holoView} onClose={() => setHoloView(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <OfficerModal officer={modal !== 'add' ? modal : null}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); refetch(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}

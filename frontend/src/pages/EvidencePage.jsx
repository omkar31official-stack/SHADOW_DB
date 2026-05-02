import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi, useMutation } from '../hooks/useApi';
import api from '../utils/api';
import PasswordPrompt from '../components/PasswordPrompt';
import HoloTerminal from '../components/HoloTerminal';

const typeIcons = { physical: '🔧', digital: '💻', documentary: '📄', testimonial: '🗣️' };
const typeColors = {
  physical: { primary: 'var(--neon-purple)', dim: 'rgba(168, 85, 247, 0.15)', glow: 'rgba(168, 85, 247, 0.4)' },
  digital: { primary: 'var(--neon-cyan)', dim: 'rgba(0, 243, 255, 0.15)', glow: 'rgba(0, 243, 255, 0.4)' },
  documentary: { primary: 'var(--neon-blue)', dim: 'rgba(0, 102, 255, 0.15)', glow: 'rgba(0, 102, 255, 0.4)' },
  testimonial: { primary: 'var(--neon-yellow)', dim: 'rgba(255, 204, 0, 0.15)', glow: 'rgba(255, 204, 0, 0.4)' }
};

const stagger = { animate: { transition: { staggerChildren: 0.05 } } };
const cardVariants = {
  initial: { opacity: 0, y: 20, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  hover: { y: -8, transition: { type: 'spring', stiffness: 400, damping: 10 } }
};

function EvidenceModal({ evidence, onClose, onSaved }) {
  const [form, setForm] = useState(evidence || {
    case_id: '', type: 'physical', description: '', location_found: '',
    collected_by: '', chain_of_custody: '',
  });
  const { mutate, loading } = useMutation();
  const { data: casesData } = useApi('/cases');
  const { data: officersData } = useApi('/officers');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (evidence?.id) await mutate('put', `/evidence/${evidence.id}`, form);
      else await mutate('post', '/evidence', form);
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
        style={{ borderTop: '3px solid var(--neon-purple)' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{evidence ? '✏️' : '🔬'}</span>
            <h2 className="modal-title">{evidence ? 'Edit Evidence' : 'Log Evidence'}</h2>
          </div>
          <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="modal-close" onClick={onClose}>✕</motion.button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Case *</label>
              <select className="form-select" value={form.case_id} onChange={set('case_id')} required>
                <option value="">Select Case</option>
                {(casesData?.data || []).map(c => <option key={c.id} value={c.id}>{c.case_number} — {c.title}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={set('type')}>
                <option value="physical">Physical</option><option value="digital">Digital</option>
                <option value="documentary">Documentary</option><option value="testimonial">Testimonial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Location Found</label>
              <input className="form-input" value={form.location_found || ''} onChange={set('location_found')} />
            </div>
            <div className="form-group">
              <label className="form-label">Collected By</label>
              <select className="form-select" value={form.collected_by || ''} onChange={set('collected_by')}>
                <option value="">Select Officer</option>
                {(officersData?.data || []).map(o => <option key={o.id} value={o.id}>{o.badge_number} — {o.first_name} {o.last_name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" value={form.description || ''} onChange={set('description')} rows={3} required />
          </div>
          <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
            <label className="form-label">Chain of Custody</label>
            <textarea className="form-textarea" value={form.chain_of_custody || ''} onChange={set('chain_of_custody')} rows={2} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="button" className="neon-btn neon-btn-ghost" onClick={onClose}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--neon-purple-glow)' }} whileTap={{ scale: 0.95 }} type="submit" className="neon-btn neon-btn-primary" style={{ background: 'rgba(168, 85, 247, 0.15)', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)' }} disabled={loading}>
              {loading ? '⏳ Saving...' : evidence ? '💾 Update' : '🔬 Log'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function EvidencePage() {
  const [modal, setModal] = useState(null);
  const [holoView, setHoloView] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, loading, refetch } = useApi('/evidence');
  const evidence = data?.data || [];

  const triggerDelete = (id, description, e) => {
    e.stopPropagation();
    setDeleteTarget({ id, name: description.substring(0, 20) + '...' });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { 
      await api.delete(`/evidence/${deleteTarget.id}`); 
      setDeleteTarget(null);
      refetch(); 
    }
    catch (err) { alert(err.message); setDeleteTarget(null); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-purple)', boxShadow: '0 0 15px var(--neon-purple)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '4px' }}>
              EVIDENCE_<span style={{ color: 'var(--neon-purple)' }}>REPOSITORY</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              SECURED FORENSIC ARTIFACTS // VERSION 4.2.0
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
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--neon-purple)' }}
          whileTap={{ scale: 0.95 }}
          className="neon-btn neon-btn-primary"
          style={{ background: 'rgba(168, 85, 247, 0.1)', borderColor: 'var(--neon-purple)', color: 'var(--neon-purple)', padding: '12px 24px' }}
          onClick={() => setModal('add')}
        >
          <span style={{ fontSize: '1.2rem' }}>🔬</span> LOG_NEW_EVIDENCE
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="grid-3">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer glass-card" style={{ height: '220px' }} />)}</div>
      ) : evidence.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="empty-state glass-card"
          style={{ height: '300px' }}
        >
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}
            className="empty-state-icon" style={{ fontSize: '4rem' }}
          >🔬</motion.div>
          <div className="display-text" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '20px' }}>NO_DATA_AVAILABLE</div>
        </motion.div>
      ) : (
        <motion.div className="grid-3" variants={stagger} initial="initial" animate="animate">
          <AnimatePresence>
            {evidence.map((e) => {
              const theme = typeColors[e.type] || typeColors.physical;
              return (
                <motion.div
                  key={e.id}
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
                  onClick={() => setHoloView(e)}
                >
                  {/* HUD Corner Decorators */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '20px', borderRight: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.1)' }} />
                  
                  {/* Scanline Overlay */}
                  <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: theme.dim, border: `1px solid ${theme.primary}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem', boxShadow: `0 0 15px ${theme.glow}40`
                    }}>
                      {typeIcons[e.type] || '📦'}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="mono" style={{
                        fontSize: '0.65rem', padding: '4px 10px', borderRadius: '2px',
                        background: theme.dim, color: theme.primary, border: `1px solid ${theme.primary}50`,
                        fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px'
                      }}>{e.type}</span>
                      <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '6px' }}>EVD_ID: {e.id.toString().padStart(4, '0')}</div>
                    </div>
                  </div>

                  <h3 className="mono" style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.4, flex: 1 }}>
                    {e.description}
                  </h3>

                  <div style={{ marginTop: 'auto' }}>
                    <div className="flex justify-between items-end">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {e.location_found && (
                          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: theme.primary, opacity: 0.8 }}>📍</span> {e.location_found.toUpperCase()}
                          </div>
                        )}
                        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ opacity: 0.8 }}>📁</span> CASE_ATTACHED: {e.case_id}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '4px' }} onClick={ev => ev.stopPropagation()}>
                        <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.05)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px' }} onClick={() => setModal(e)}>✏️</motion.button>
                        <motion.button whileHover={{ scale: 1.1, background: 'rgba(255,42,42,0.1)', color: 'var(--neon-red)' }} whileTap={{ scale: 0.9 }} className="neon-btn neon-btn-ghost neon-btn-sm" style={{ padding: '6px', color: 'var(--text-muted)' }}
                          onClick={(ev) => triggerDelete(e.id, e.description, ev)}>🗑️</motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom HUD bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', background: theme.primary, boxShadow: `0 0 10px ${theme.primary}` }}
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
        {holoView && <HoloTerminal type="evidence" data={holoView} onClose={() => setHoloView(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {modal && <EvidenceModal evidence={modal !== 'add' ? modal : null}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); refetch(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function PasswordPrompt({ onConfirm, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === '1111') {
      onConfirm();
    } else {
      setError('ACCESS DENIED: INCORRECT OVERRIDE CODE');
      setPassword('');
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <motion.div 
        className="modal-content"
        style={{ border: '2px solid var(--neon-red)', boxShadow: '0 0 30px rgba(255, 42, 42, 0.4)' }}
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div className="display-text" style={{ fontSize: '1.5rem', color: 'var(--neon-red)', textShadow: 'var(--glow-red)' }}>
            ⚠️ DESTRUCTIVE ACTION DETECTED
          </div>
          <p className="mono text-sm" style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
            System override required for this operation.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <input
            type="password"
            autoFocus
            className="form-input mono"
            style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', background: 'rgba(255, 42, 42, 0.05)', borderColor: error ? 'var(--neon-red)' : 'var(--border-subtle)' }}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="****"
          />
          {error && <div className="mono text-xs" style={{ color: 'var(--neon-red)' }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px', width: '100%', justifyContent: 'center' }}>
            <button type="button" className="neon-btn neon-btn-ghost" onClick={onCancel}>ABORT</button>
            <button type="submit" className="neon-btn neon-btn-danger">CONFIRM_OVERRIDE</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

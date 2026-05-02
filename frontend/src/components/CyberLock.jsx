import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CyberLock({ onComplete }) {
  const [status, setStatus] = useState('LOCKED');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage 1: Scanning (0-1s)
    const scanTimer = setTimeout(() => {
      setStatus('DECRYPTING');
    }, 1000);

    // Stage 2: Progress bar (1-3s)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    // Stage 3: Unlock (3s)
    const unlockTimer = setTimeout(() => {
      setStatus('ACCESS_GRANTED');
    }, 3200);

    // Stage 4: Fade out (4s)
    const finishTimer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(scanTimer);
      clearInterval(progressInterval);
      clearTimeout(unlockTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#020b14', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden'
      }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
      transition={{ duration: 1 }}
    >
      <div className="ambient-bg" style={{ zIndex: -1 }} />
      <div className="scan-line-overlay" style={{ zIndex: 0 }} />

      <div style={{ position: 'relative', width: '400px', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Outer Rotating Rings */}
        <motion.div 
          animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', width: '300px', height: '300px', border: '2px dashed var(--neon-cyan)', borderRadius: '50%', opacity: 0.3 }}
        />
        <motion.div 
          animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          style={{ position: 'absolute', width: '340px', height: '340px', border: '1px solid var(--neon-blue)', borderRadius: '50%', opacity: 0.2, borderTopColor: 'transparent' }}
        />

        {/* Central Lock HUD */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ zIndex: 10, textAlign: 'center' }}
        >
          <motion.div 
            animate={status === 'ACCESS_GRANTED' ? { scale: [1, 1.2, 1], color: 'var(--neon-green)' } : {}}
            style={{ fontSize: '4rem', color: status === 'ACCESS_GRANTED' ? 'var(--neon-green)' : 'var(--neon-cyan)', textShadow: '0 0 20px currentColor' }}
          >
            {status === 'ACCESS_GRANTED' ? '🔓' : '🔒'}
          </motion.div>

          <div className="display-text" style={{ fontSize: '1.2rem', marginTop: '20px', letterSpacing: '4px', color: status === 'ACCESS_GRANTED' ? 'var(--neon-green)' : 'white' }}>
            {status}
          </div>

          <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', margin: '15px auto', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              style={{ height: '100%', background: status === 'ACCESS_GRANTED' ? 'var(--neon-green)' : 'var(--neon-cyan)', boxShadow: `0 0 10px ${status === 'ACCESS_GRANTED' ? 'var(--neon-green)' : 'var(--neon-cyan)'}` }}
            />
          </div>

          <AnimatePresence>
            {status === 'ACCESS_GRANTED' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glitch-text"
                style={{ fontSize: '1.5rem', color: 'white', fontWeight: 'bold', marginTop: '10px' }}
                data-text="WELCOME TO SHADOWDB"
              >
                WELCOME TO SHADOWDB
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Corner Brackets */}
        {[0, 90, 180, 270].map(rot => (
          <div key={rot} style={{ position: 'absolute', width: '100%', height: '100%', transform: `rotate(${rot}deg)`, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderLeft: '2px solid var(--neon-cyan)', borderTop: '2px solid var(--neon-cyan)' }} />
          </div>
        ))}
      </div>

      {/* Background Decorative Grid */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(0,243,255,0.05) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: -1 }} />
    </motion.div>
  );
}

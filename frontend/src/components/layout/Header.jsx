import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header({ connected }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="app-header glass" style={{ 
      height: '70px', 
      width: '100%',
      position: 'relative',
      borderBottom: '1px solid var(--border-medium)',
      zIndex: 1000,
      background: 'rgba(2, 11, 20, 0.95)',
      backdropFilter: 'blur(15px)',
      overflow: 'hidden'
    }}>
      <div className="scan-line-overlay" style={{ opacity: 0.05, zIndex: -1 }} />

      {/* Left HUD: Clock & Identity */}
      <div style={{
        position: 'absolute',
        left: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', paddingRight: '20px' }}>
          <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--neon-cyan)', fontWeight: 800, letterSpacing: '1.5px' }}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
          </div>
          <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            LOCAL_TERMINAL_TIME
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>
            UPLINK_ID: <span style={{ color: 'var(--neon-cyan)' }}>S-DB_99X</span>
          </div>
          <div className="mono" style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>
            ENCRYPTION: <span style={{ color: 'var(--neon-green)' }}>AES-256_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* CENTER TITLE: Perfectly Positioned */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ position: 'relative', padding: '0 40px' }}
        >
          {/* HUD Brackets */}
          <div style={{ position: 'absolute', top: '-10px', left: 0, width: '12px', height: '12px', borderLeft: '2px solid var(--neon-cyan)', borderTop: '2px solid var(--neon-cyan)' }} />
          <div style={{ position: 'absolute', top: '-10px', right: 0, width: '12px', height: '12px', borderRight: '2px solid var(--neon-cyan)', borderTop: '2px solid var(--neon-cyan)' }} />
          <div style={{ position: 'absolute', bottom: '-10px', left: 0, width: '12px', height: '12px', borderLeft: '2px solid var(--neon-cyan)', borderBottom: '2px solid var(--neon-cyan)' }} />
          <div style={{ position: 'absolute', bottom: '-10px', right: 0, width: '12px', height: '12px', borderRight: '2px solid var(--neon-cyan)', borderBottom: '2px solid var(--neon-cyan)' }} />
          
          <div className="display-text animate-glitch-red animate-glitch-perm" style={{ 
            fontSize: '1.8rem', 
            fontWeight: 900, 
            letterSpacing: '10px', 
            color: '#fff', 
            textShadow: '0 0 15px var(--neon-cyan-glow)',
            whiteSpace: 'nowrap' 
          }}>
            SHADOWDB
          </div>
          <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--neon-blue)', letterSpacing: '4px', marginTop: '4px', opacity: 0.8 }}>
            INTEL_PLATFORM_V2.0.4
          </div>
        </motion.div>
      </div>

      {/* Right HUD: Connectivity & Resource Metrics */}
      <div style={{
        position: 'absolute',
        right: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '25px'
      }}>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>MEM_LOAD: 42.4%</div>
          <div style={{ width: '80px', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
            <motion.div animate={{ width: ['20%', '85%', '42%'] }} transition={{ duration: 4, repeat: Infinity }} style={{ height: '100%', background: 'var(--neon-blue)' }} />
          </div>
        </div>

        <motion.div 
          style={{ 
            padding: '5px 15px', 
            borderRadius: '2px', 
            border: `1px solid ${connected ? 'rgba(0, 243, 255, 0.4)' : 'var(--neon-red)'}`,
            background: connected ? 'rgba(0, 243, 255, 0.05)' : 'rgba(255, 23, 68, 0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <motion.div 
            animate={{ opacity: connected ? [0.4, 1, 0.4] : 1 }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              width: '8px', height: '8px', borderRadius: '50%',
              background: connected ? 'var(--neon-cyan)' : 'var(--neon-red)',
              boxShadow: connected ? '0 0 10px var(--neon-cyan)' : '0 0 10px var(--neon-red)'
            }}
          />
          <span className="mono" style={{ fontSize: '0.65rem', color: connected ? 'var(--neon-cyan)' : 'var(--neon-red)', fontWeight: 800 }}>
            {connected ? 'LINK_ACTIVE' : 'OFFLINE'}
          </span>
        </motion.div>
      </div>
    </header>
  );
}

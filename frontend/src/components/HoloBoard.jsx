import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// SVG Line connecting two elements (using coordinates relative to board)
const LaserLine = ({ x1, y1, x2, y2, color }) => (
  <motion.line 
    x1={x1} y1={y1} x2={x2} y2={y2} 
    stroke={color || "var(--neon-red)"} 
    strokeWidth="2" 
    strokeDasharray="4 4"
    initial={{ pathLength: 0, opacity: 0 }}
    animate={{ pathLength: 1, opacity: 1 }}
    transition={{ duration: 1.5, ease: "easeInOut" }}
    style={{ filter: `drop-shadow(0 0 5px ${color || "var(--neon-red)"})` }}
  />
);

const HoloNode = ({ x, y, delay, title, children, color, rotate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8, y: y + 30 }}
    animate={{ opacity: 1, scale: 1, y, rotate: rotate || 0 }}
    transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
    style={{
      position: 'absolute',
      left: x,
      top: y,
      background: 'rgba(4, 16, 30, 0.85)',
      border: `1px solid ${color || 'var(--border-medium)'}`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.8), 0 0 15px ${color ? color.replace(')', ', 0.3)').replace('rgb', 'rgba') : 'var(--neon-cyan-glow)'}`,
      backdropFilter: 'blur(10px)',
      padding: '15px',
      borderRadius: '4px',
      zIndex: 10,
    }}
    className="hud-brackets"
  >
    {/* Pin / Thumbtack replacement (glowing node) */}
    <div style={{ position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', background: color || 'var(--neon-cyan)', borderRadius: '50%', boxShadow: `0 0 10px ${color || 'var(--neon-cyan)'}` }} />
    
    {title && (
      <div className="mono text-xs mb-2" style={{ color: color || 'var(--neon-cyan)', borderBottom: `1px solid ${color || 'var(--border-subtle)'}`, paddingBottom: '4px', textTransform: 'uppercase' }}>
        {title}
      </div>
    )}
    {children}
  </motion.div>
);

export default function HoloBoard({ criminal, onClose }) {
  // Use state to trigger SVG lines after nodes are mounted (though here we hardcode positions for the cool effect)
  const [linesReady, setLinesReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLinesReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!criminal) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 100,
        background: 'radial-gradient(ellipse at center, var(--bg-primary) 0%, var(--bg-void) 100%)',
        overflow: 'hidden'
      }}
    >
      <div className="ambient-bg" />
      <div className="scan-line-overlay" />

      {/* Close button */}
      <button 
        onClick={onClose}
        className="neon-btn neon-btn-ghost absolute" 
        style={{ top: '20px', right: '20px', zIndex: 100 }}
      >
        [CLOSE_BOARD]
      </button>

      <div className="display-text absolute" style={{ top: '20px', left: '30px', color: 'var(--neon-cyan)', fontSize: '1.5rem', letterSpacing: '2px', textShadow: 'var(--glow-cyan)' }}>
        SYS.INVESTIGATION_BOARD // TARGET: {criminal.id}
      </div>

      {/* SVG Canvas for Laser Strings */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }}>
        {linesReady && (
          <>
            {/* Center to top left (Profile to Identity) */}
            <LaserLine x1="50%" y1="50%" x2="25%" y2="25%" color="var(--neon-cyan)" />
            {/* Center to bottom left (Profile to Physical) */}
            <LaserLine x1="50%" y1="50%" x2="28%" y2="70%" color="var(--neon-red)" />
            {/* Center to top right (Profile to Status) */}
            <LaserLine x1="50%" y1="50%" x2="75%" y2="30%" color="var(--neon-yellow)" />
            {/* Center to bottom right (Profile to Cases) */}
            <LaserLine x1="50%" y1="50%" x2="72%" y2="65%" color="var(--neon-blue)" />
            {/* Cross connections */}
            <LaserLine x1="25%" y1="25%" x2="75%" y2="30%" color="var(--border-medium)" />
          </>
        )}
      </svg>

      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        
        {/* CENTER NODE: Profile Photo & Name */}
        <HoloNode x="calc(50% - 100px)" y="calc(50% - 120px)" delay={0.1} color="var(--neon-cyan)">
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '150px', height: '150px', border: '1px solid var(--neon-cyan)', background: 'var(--bg-void)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '4rem', opacity: 0.5 }}>👤</span>
            </div>
            <h2 className="display-text" style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{criminal.first_name}</h2>
            <h1 className="display-text" style={{ margin: 0, color: 'var(--neon-cyan)', fontSize: '1.5rem', textShadow: 'var(--glow-cyan)' }}>{criminal.last_name}</h1>
          </div>
        </HoloNode>

        {/* TOP LEFT NODE: Identity & Aliases */}
        <HoloNode x="calc(25% - 120px)" y="calc(25% - 50px)" delay={0.3} title="KNOWN_ALIASES" rotate={-3}>
          <div className="mono text-lg" style={{ color: '#fff', padding: '10px 0' }}>
            "{criminal.alias || 'UNKNOWN'}"
          </div>
          <div className="mono text-xs" style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
            NAT: {criminal.nationality || 'UNKNOWN'}<br/>
            DOB: {criminal.date_of_birth ? new Date(criminal.date_of_birth).toLocaleDateString() : 'UNKNOWN'}
          </div>
        </HoloNode>

        {/* BOTTOM LEFT NODE: Physical Attributes */}
        <HoloNode x="calc(28% - 120px)" y="calc(70% - 60px)" delay={0.5} title="PHYSICAL_PROFILE" color="var(--neon-red)" rotate={2}>
          <table className="mono text-xs" style={{ width: '100%', color: '#fff', borderSpacing: '0 8px' }}>
            <tbody>
              <tr><td style={{ color: 'var(--text-muted)' }}>GENDER</td><td style={{ textAlign: 'right' }}>{criminal.gender}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>HEIGHT</td><td style={{ textAlign: 'right' }}>{criminal.height_cm ? `${criminal.height_cm} cm` : '—'}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>WEIGHT</td><td style={{ textAlign: 'right' }}>{criminal.weight_kg ? `${criminal.weight_kg} kg` : '—'}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>EYES</td><td style={{ textAlign: 'right' }}>{criminal.eye_color || '—'}</td></tr>
              <tr><td style={{ color: 'var(--text-muted)' }}>FINGERPRINT</td><td style={{ textAlign: 'right', color: 'var(--neon-red)' }}>{criminal.fingerprint_id || 'NOT_ON_FILE'}</td></tr>
            </tbody>
          </table>
        </HoloNode>

        {/* TOP RIGHT NODE: Status & Danger */}
        <HoloNode x="calc(75% - 120px)" y="calc(30% - 60px)" delay={0.4} title="THREAT_ASSESSMENT" color="var(--neon-yellow)" rotate={4}>
          <div style={{ marginBottom: '15px' }}>
            <div className="mono text-xs text-muted mb-1">STATUS</div>
            <div className="display-text" style={{ color: criminal.status === 'wanted' ? 'var(--neon-red)' : 'var(--neon-green)', fontSize: '1.2rem' }}>
              [{criminal.status}]
            </div>
          </div>
          <div>
            <div className="mono text-xs text-muted mb-1">DANGER_LEVEL</div>
            <div className="display-text" style={{ color: 'var(--neon-yellow)', fontSize: '1.2rem', textShadow: 'var(--glow-cyan)' }}>
              [{criminal.danger_level}]
            </div>
          </div>
        </HoloNode>

        {/* BOTTOM RIGHT NODE: Notes / Description */}
        <HoloNode x="calc(72% - 150px)" y="calc(65% - 60px)" delay={0.6} title="INTEL_SUMMARY" color="var(--neon-blue)" rotate={-2}>
          <div className="mono text-sm" style={{ color: '#fff', maxWidth: '250px', lineHeight: 1.5 }}>
            {criminal.description || "No intelligence summary available for this subject."}
          </div>
          <div className="mono text-xs" style={{ color: 'var(--text-muted)', marginTop: '15px', borderTop: '1px solid var(--border-subtle)', paddingTop: '5px' }}>
            LAST_UPDATED: {new Date(criminal.updated_at).toLocaleString()}
          </div>
        </HoloNode>

      </div>
    </motion.div>
  );
}

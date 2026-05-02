import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import CyberLock from '../components/CyberLock';

const stagger = { animate: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, type: 'spring', stiffness: 300 } },
};

function AnimatedNumber({ value, color }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const target = parseInt(value) || 0;
    const start = prevRef.current;
    if (target === start) return;
    let current = start;
    const diff = target - start;
    const step = diff > 0 ? Math.max(1, Math.ceil(diff / 30)) : Math.min(-1, Math.floor(diff / 30));
    const timer = setInterval(() => {
      current += step;
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        current = target;
        clearInterval(timer);
      }
      setDisplay(current);
    }, 20);
    prevRef.current = target;
    return () => clearInterval(timer);
  }, [value]);
  return <span style={{ color }}>{display}</span>;
}

function StatCard({ icon, label, value, color, delay = 0 }) {
  return (
    <motion.div 
      className="hud-brackets glass" 
      variants={fadeUp}
      whileHover={{ y: -4, boxShadow: `0 8px 30px ${color}25`, borderColor: `${color}40`, scale: 1.02 }}
      style={{
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(2, 11, 20, 0.4)',
        clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
        border: '1px solid var(--border-subtle)'
      }}
    >
      <div className="stat-icon" style={{ opacity: 0.2, fontSize: '2.5rem' }}>{icon}</div>
      <div className="stat-value" style={{ fontSize: '2.5rem', marginTop: '10px' }}>
        <AnimatedNumber value={value} color={color} />
      </div>
      <div className="stat-label" style={{ letterSpacing: '2px', color: 'var(--text-tertiary)' }}>{label}</div>
      <motion.div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
          background: color,
          opacity: 0.3
        }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.3, duration: 0.8 }}
      />
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick, color }) {
  return (
    <motion.button
      className="neon-btn neon-btn-ghost"
      onClick={onClick}
      style={{ flex: 1, minWidth: '120px', justifyContent: 'center' }}
      whileHover={{ scale: 1.04, borderColor: color, color: color, boxShadow: `0 0 15px ${color}30` }}
      whileTap={{ scale: 0.96 }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </motion.button>
  );
}

function LivePulse() {
  return (
    <motion.div
      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
    >
      <motion.div
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--neon-green)', boxShadow: '0 0 8px var(--neon-green-glow)' }}
      />
      SYSTEM ACTIVE
    </motion.div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [showLock, setShowLock] = useState(false);
  const { data: analytics } = useApi('/analytics/overview');
  const stats = analytics || {};

  useEffect(() => {
    const hasUnlocked = sessionStorage.getItem('shadowdb_unlocked');
    if (!hasUnlocked) {
      setShowLock(true);
    }
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem('shadowdb_unlocked', 'true');
    setShowLock(false);
  };

  return (
    <div>
      <AnimatePresence>
        {showLock && <CyberLock onComplete={handleUnlock} />}
      </AnimatePresence>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <motion.h1 className="page-title" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
            <span className="neon-text-blue">Dashboard</span>
          </motion.h1>
          <motion.p className="page-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            ShadowDB Intelligence System — Overview
          </motion.p>
        </div>
        <LivePulse />
      </div>

      {/* Primary Stats */}
      <motion.div className="grid-4" variants={stagger} initial="initial" animate="animate">
        <StatCard icon="🔫" label="Total Criminals" value={stats.totalCriminals} color="var(--neon-red)" delay={0} />
        <StatCard icon="📁" label="Active Cases" value={stats.activeCases} color="var(--neon-blue)" delay={0.1} />
        <StatCard icon="🛡️" label="Officers" value={stats.totalOfficers} color="var(--neon-cyan)" delay={0.2} />
        <StatCard icon="🔬" label="Evidence Items" value={stats.totalEvidence} color="var(--neon-purple)" delay={0.3} />
      </motion.div>

      {/* Secondary Stats */}
      <motion.div className="grid-4" variants={stagger} initial="initial" animate="animate" style={{ marginTop: 'var(--space-md)' }}>
        <StatCard icon="🚨" label="Wanted" value={stats.wantedCriminals} color="var(--status-wanted)" delay={0.15} />
        <StatCard icon="🔍" label="Investigating" value={stats.investigatingCases} color="var(--status-investigating)" delay={0.25} />
        <StatCard icon="✅" label="Closed Cases" value={stats.closedCases} color="var(--status-closed)" delay={0.35} />
        <StatCard icon="⚠️" label="Critical Danger" value={stats.criticalCriminals} color="var(--danger-critical)" delay={0.45} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        style={{ marginTop: 'var(--space-xl)' }}
      >
        <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>⚡</motion.span>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          <QuickAction icon="➕" label="Add Criminal" onClick={() => navigate('/criminals')} color="var(--neon-red)" />
          <QuickAction icon="📂" label="New Case" onClick={() => navigate('/cases')} color="var(--neon-blue)" />
          <QuickAction icon="🔬" label="Log Evidence" onClick={() => navigate('/evidence')} color="var(--neon-cyan)" />
          <QuickAction icon="🕵️" label="Detective Board" onClick={() => navigate('/detective-board')} color="var(--neon-purple)" />
          <QuickAction icon="💾" label="DB Explorer" onClick={() => navigate('/db-explorer')} color="var(--neon-yellow)" />
        </div>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid-2" style={{ marginTop: 'var(--space-xl)' }}>
        <motion.div className="glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, type: 'spring' }}>
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.95rem' }}>📋 Recent Entries</h3>
          {stats.recentCriminals?.length > 0 ? (
            stats.recentCriminals.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,23,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                }}>🔫</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.first_name} {c.last_name}{c.alias ? ` "${c.alias}"` : ''}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>{new Date(c.created_at).toLocaleDateString()}</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
              <motion.div className="empty-state-icon" animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>📭</motion.div>
              <div className="empty-state-text">No records yet. Add criminals to see recent activity.</div>
            </div>
          )}
        </motion.div>

        <motion.div className="glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, type: 'spring' }}>
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '0.95rem' }}>🖥️ System Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              ['Database', 'SQLite 3.x', 'var(--neon-blue)'],
              ['Backend', 'Node.js + Express', 'var(--neon-green)'],
              ['Frontend', 'React 19 + Vite', 'var(--neon-cyan)'],
              ['Real-time', 'Socket.IO WebSocket', 'var(--neon-purple)'],
              ['Charts', 'Recharts', 'var(--neon-yellow)'],
              ['Animations', 'Framer Motion', 'var(--neon-red)'],
            ].map(([label, value, color], i) => (
              <motion.div key={label} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color }}>{value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

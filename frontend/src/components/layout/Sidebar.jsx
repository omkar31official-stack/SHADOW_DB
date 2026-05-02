import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { label: 'OPERATIONS', section: true },
  { path: '/', icon: '◱', label: 'Dashboard' },
  { path: '/criminals', icon: '◲', label: 'Criminals' },
  { path: '/cases', icon: '◳', label: 'Cases' },
  { path: '/evidence', icon: '◰', label: 'Evidence' },
  { path: '/officers', icon: '◈', label: 'Officers' },
  { label: 'INTELLIGENCE', section: true },
  { path: '/analytics', icon: '⎈', label: 'Analytics' },
  { path: '/detective-board', icon: '⎉', label: 'Detective Board' },
  { path: '/concepts', icon: '◈', label: 'DBMS Concepts' },
  { label: 'SYSTEM', section: true },
  { path: '/db-explorer', icon: '⎊', label: 'DB Explorer' },
];

export default function Sidebar() {
  const [hoveredPath, setHoveredPath] = useState(null);

  return (
    <aside className="sidebar flex flex-col">
      {/* Navigation */}
      <nav className="sidebar-nav" style={{ padding: '20px 0', flex: 1, overflowY: 'auto' }}>
        {navItems.map((item, i) =>
          item.section ? (
            <motion.div 
              key={i} 
              className="sidebar-section-label flex items-center"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              style={{ padding: '0 20px', marginBottom: '10px', marginTop: i > 0 ? '20px' : 0 }}
            >
              <span className="mono text-xs" style={{ color: 'var(--text-muted)', letterSpacing: '2px' }}>[{item.label}]</span>
              <div style={{ height: '1px', flex: 1, background: 'linear-gradient(90deg, var(--border-medium), transparent)', marginLeft: '10px' }} />
            </motion.div>
          ) : (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.1 }}
              onHoverStart={() => setHoveredPath(item.path)}
              onHoverEnd={() => setHoveredPath(null)}
              style={{ position: 'relative', margin: '2px 10px' }}
            >
              <NavLink
                to={item.path}
                style={{ 
                  display: 'flex', alignItems: 'center', padding: '12px 15px', 
                  borderRadius: '4px', textDecoration: 'none', color: 'var(--text-secondary)',
                  position: 'relative', zIndex: 1
                }}
                end={item.path === '/'}
              >
                {({ isActive }) => (
                  <>
                    <AnimatePresence>
                      {(isActive || hoveredPath === item.path) && (
                        <motion.div
                          layoutId="sidebar-highlight"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          style={{
                            position: 'absolute', inset: 0,
                            background: isActive ? 'linear-gradient(90deg, rgba(0,243,255,0.15), transparent)' : 'rgba(0,102,255,0.1)',
                            borderLeft: isActive ? '3px solid var(--neon-cyan)' : '3px solid var(--neon-blue)',
                            zIndex: -1
                          }}
                        />
                      )}
                    </AnimatePresence>
                    
                    <span className="mono" style={{ 
                      color: isActive ? 'var(--neon-cyan)' : 'var(--text-tertiary)',
                      fontSize: '1.2rem', marginRight: '15px',
                      textShadow: isActive ? 'var(--glow-cyan)' : 'none'
                    }}>{item.icon}</span>
                    <span className="display-text" style={{ 
                      color: isActive ? '#fff' : 'inherit',
                      fontSize: '0.85rem', fontWeight: isActive ? 600 : 400,
                      textShadow: isActive ? '0 0 5px rgba(255,255,255,0.5)' : 'none'
                    }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          )
        )}
      </nav>

      {/* Sidebar Footer - User Profile */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-medium)', background: 'rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-md">
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--neon-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)'
          }}>
            <span style={{ fontSize: '1rem' }}>🕵️</span>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>AGENT_OMEGA</div>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>LEVEL_4_CLEARANCE</div>
          </div>
        </div>
        <motion.div 
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{ height: '2px', background: 'var(--neon-cyan)', marginTop: '15px', borderRadius: '2px' }} 
        />
      </div>
    </aside>
  );
}

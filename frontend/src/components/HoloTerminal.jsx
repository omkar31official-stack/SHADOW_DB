import React from 'react';
import { motion } from 'framer-motion';

const priorityColors = { low: 'var(--danger-low)', medium: 'var(--danger-medium)', high: 'var(--danger-high)', critical: 'var(--danger-critical)' };

export default function HoloTerminal({ type, data, onClose }) {
  // A giant, full-screen holographic terminal based on the UI screenshot
  const title = type === 'case' ? data.title : (type === 'criminal' ? `${data.first_name} ${data.last_name}` : `EVIDENCE_ID_${data.id}`);
  const subtitle = type === 'case' ? data.case_number : (type === 'criminal' ? (data.alias || 'NO ALIAS') : data.type.toUpperCase());
  
  return (
    <motion.div 
      className="modal-overlay"
      style={{ zIndex: 2000, background: 'rgba(2, 11, 20, 0.98)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="ambient-bg" style={{ zIndex: -1, opacity: 0.5 }} />
      <div className="scan-line-overlay" style={{ zIndex: -1, opacity: 0.3 }} />

      <div style={{ position: 'absolute', top: '30px', right: '30px', cursor: 'pointer', zIndex: 100 }} onClick={onClose}>
        <motion.div whileHover={{ scale: 1.2, rotate: 90 }} style={{ fontSize: '2rem', color: 'var(--neon-cyan)', textShadow: 'var(--glow-cyan)' }}>✕</motion.div>
      </div>

      <motion.div 
        style={{ width: '90%', height: '85%', position: 'relative', display: 'flex', flexDirection: 'column', margin: 'auto' }}
        initial={{ scale: 0.9, filter: 'blur(10px)' }}
        animate={{ scale: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        
        {/* Header HUD Element */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div className="display-text" style={{ fontSize: '2.5rem', color: 'var(--neon-cyan)', textShadow: 'var(--glow-cyan-strong)', letterSpacing: '4px' }}>
              INTEL_UPLINK_TERM
            </div>
            <div className="mono text-xs" style={{ color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '5px' }}>
              SECURE_ACCESS // {type.toUpperCase()} // STATUS: ACTIVE
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <motion.div animate={{ rotate: 180 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ width: '40px', height: '40px', border: '1px dashed var(--neon-cyan)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '4px', height: '4px', background: 'var(--neon-cyan)' }} />
            </motion.div>
            <motion.div animate={{ rotate: -180 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              style={{ width: '40px', height: '40px', border: '1px dashed var(--neon-blue)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '4px', height: '4px', background: 'var(--neon-blue)' }} />
            </motion.div>
          </div>
        </div>

        {/* Main Interface Layout - Angled Corners */}
        <div style={{ display: 'flex', gap: '30px', flex: 1, height: '100%' }}>
          
          {/* Left Large Panel */}
          <div style={{ flex: 2, position: 'relative' }}>
             <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0, 102, 255, 0.1)',
                border: '2px solid var(--neon-cyan)',
                clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 40px 100%, 0 calc(100% - 40px))',
                boxShadow: 'inset 0 0 30px rgba(0, 243, 255, 0.2)',
                padding: '40px',
                display: 'flex', flexDirection: 'column'
             }}>
               <div style={{ position: 'absolute', top: 0, left: 0, width: '20px', height: '2px', background: 'var(--neon-cyan)' }} />
               <div style={{ position: 'absolute', top: 0, left: 0, width: '2px', height: '20px', background: 'var(--neon-cyan)' }} />
               
               <h1 className="display-text" style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', marginBottom: '10px', textShadow: '0 0 10px rgba(255,255,255,0.5)' }}>
                 {title}
               </h1>
               <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--neon-cyan)', marginBottom: '20px', opacity: 0.8 }}>
                 [ {subtitle} ]
               </div>
               
               {data.status && (
                 <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                   <span className={`status-badge ${data.status}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>{data.status.toUpperCase()}</span>
                   {data.danger_level && <span className={`danger-badge ${data.danger_level}`} style={{ fontSize: '1rem', padding: '8px 20px' }}>{data.danger_level.toUpperCase()} THREAT</span>}
                   {data.priority && <span style={{ fontSize: '1rem', padding: '8px 20px', background: `${priorityColors[data.priority]}20`, color: priorityColors[data.priority], border: `1px solid ${priorityColors[data.priority]}`, borderRadius: '30px', fontWeight: 'bold', textTransform: 'uppercase' }}>{data.priority} PRIORITY</span>}
                 </div>
               )}

               <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', padding: '25px', border: '1px solid var(--border-medium)', borderRadius: '4px', overflowY: 'auto' }}>
                 <p className="mono" style={{ fontSize: '1.2rem', color: 'var(--text-primary)', lineHeight: 1.8 }}>
                   {data.description || 'NO_DATA_LOGGED_IN_CORE_MEMORY.'}
                 </p>
               </div>
             </div>
          </div>

          {/* Right Data Panels */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
             
             {/* Data block 1 */}
             <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}
               style={{ flex: 1, background: 'rgba(0, 102, 255, 0.05)', border: '1px solid var(--neon-blue)',
               clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)',
               padding: '25px'
             }}>
               <h3 className="mono" style={{ color: 'var(--neon-blue)', marginBottom: '15px', letterSpacing: '2px' }}>// REGISTRY_DATA</h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 {Object.entries(data).map(([key, val]) => {
                   if (typeof val === 'object' || key === 'description' || key === 'id' || key.includes('badge')) return null;
                   return (
                     <div key={key} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: '4px' }}>
                       <span className="mono text-xs" style={{ color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{key.replace('_', ' ')}:</span>
                       <span className="mono text-xs" style={{ color: 'white' }}>{val || 'NULL'}</span>
                     </div>
                   );
                 })}
               </div>
             </motion.div>

             {/* Metrics block */}
             <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
               style={{ height: '180px', background: 'rgba(0, 102, 255, 0.05)', border: '1px solid var(--neon-blue)',
               clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
               padding: '25px', position: 'relative'
             }}>
               <h3 className="mono" style={{ color: 'var(--neon-blue)', marginBottom: '15px', letterSpacing: '2px' }}>// SYSTEM_SIGNAL</h3>
               <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                 <motion.div 
                   animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }} 
                   transition={{ duration: 1.5, repeat: Infinity }}
                   style={{ width: '60px', height: '60px', border: '3px solid var(--neon-cyan)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                 >
                   <div style={{ width: '30px', height: '30px', background: 'var(--neon-cyan)', borderRadius: '50%', opacity: 0.5 }} />
                 </motion.div>
                 <div>
                   <div className="display-text" style={{ fontSize: '1.5rem', color: 'var(--neon-cyan)', textShadow: 'var(--glow-cyan)' }}>STABLE</div>
                   <div className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>UPLINK_QUALITY_100%</div>
                 </div>
               </div>
             </motion.div>

          </div>
        </div>

        {/* Bottom Decorators */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          {[1,2,3,4,5,6,7,8].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
              style={{ width: '40px', height: '4px', background: 'var(--neon-blue)', transform: 'skewX(-45deg)' }} />
          ))}
        </div>

      </motion.div>
    </motion.div>
  );
}

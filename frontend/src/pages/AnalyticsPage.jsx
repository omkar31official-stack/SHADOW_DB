import React from 'react';
import { motion } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['var(--neon-cyan)', 'var(--neon-red)', 'var(--neon-green)', 'var(--neon-yellow)', 'var(--neon-purple)', 'var(--neon-blue)', '#ff6d00'];

const chartTooltipStyle = {
  backgroundColor: 'rgba(2, 11, 20, 0.9)',
  border: '1px solid var(--border-medium)',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '0.75rem',
  fontFamily: 'var(--font-mono)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(10px)',
};

const stagger = { animate: { transition: { staggerChildren: 0.1 } } };
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function AnalyticsPage() {
  const { data: overview } = useApi('/analytics/overview');
  const { data: crimeTypes } = useApi('/analytics/crime-types');
  const { data: statusDist } = useApi('/analytics/status-distribution');
  const { data: timeline } = useApi('/analytics/timeline');

  const stats = overview || {};
  const crimeData = crimeTypes?.data || [];
  const statusData = statusDist?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-purple)', boxShadow: '0 0 15px var(--neon-purple)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '4px' }}>
              SYSTEM_<span style={{ color: 'var(--neon-purple)' }}>ANALYTICS</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              CRIME STATISTICS // INTELLIGENCE REPORTS // DATA_STREAM_V4
            </p>
          </div>
        </motion.div>
      </div>

      {/* Top Stats */}
      <motion.div className="grid-4" variants={stagger} initial="initial" animate="animate" style={{ marginBottom: '40px' }}>
        {[
          ['🔫', 'Criminals', stats.totalCriminals, 'var(--neon-red)'],
          ['📁', 'Cases', stats.totalCases, 'var(--neon-blue)'],
          ['🛡️', 'Officers', stats.totalOfficers, 'var(--neon-cyan)'],
          ['🔬', 'Evidence', stats.totalEvidence, 'var(--neon-purple)'],
        ].map(([icon, label, value, color]) => (
          <motion.div 
            className="glass-card" 
            key={label}
            variants={cardVariants}
            whileHover={{ y: -5, borderColor: color, boxShadow: `0 10px 30px ${color}20` }}
            style={{ 
              borderLeft: `3px solid ${color}`,
              background: 'rgba(2, 11, 20, 0.6)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '1.5rem', opacity: 0.3 }}>{icon}</div>
            
            <div className="display-text" style={{ fontSize: '2.2rem', fontWeight: 900, color, marginBottom: '4px' }}>{value ?? '00'}</div>
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', letterSpacing: '2px' }}>{label.toUpperCase()}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginTop: 'var(--space-xl)', gap: '30px' }}>
        {/* Crime Type Distribution */}
        <motion.div className="chart-container glass-card" initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: 'spring' }}
          style={{ background: 'rgba(2, 11, 20, 0.6)', padding: '24px', border: '1px solid var(--border-subtle)' }}
        >
          <div className="chart-header" style={{ marginBottom: '24px' }}>
            <h3 className="mono" style={{ color: 'var(--neon-cyan)', fontSize: '0.9rem', letterSpacing: '2px' }}>[ CRIME_TYPE_DISTRIBUTION ]</h3>
          </div>
          {crimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="crime_type" tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                <YAxis tick={{ fill: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono)' }} axisLine={{ stroke: 'var(--border-subtle)' }} />
                <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" radius={[2, 2, 0, 0]} animationDuration={1500}>
                  {crimeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '300px' }}>
              <div className="mono text-muted">NO_DATA_AVAILABLE</div>
            </div>
          )}
        </motion.div>

        {/* Case Status Distribution */}
        <motion.div className="chart-container glass-card" initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, type: 'spring' }}
          style={{ background: 'rgba(2, 11, 20, 0.6)', padding: '24px', border: '1px solid var(--border-subtle)' }}
        >
          <div className="chart-header" style={{ marginBottom: '24px' }}>
            <h3 className="mono" style={{ color: 'var(--neon-yellow)', fontSize: '0.9rem', letterSpacing: '2px' }}>[ CASE_STATUS_BREAKDOWN ]</h3>
          </div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={110}
                  dataKey="count" nameKey="status" paddingAngle={5} animationDuration={1500}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend formatter={(v) => <span className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem' }}>{v.toUpperCase()}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ height: '300px' }}>
              <div className="mono text-muted">NO_DATA_AVAILABLE</div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Global Threat Monitor */}
      <motion.div 
        className="glass-card hud-brackets" 
        style={{ marginTop: '40px', height: '450px', position: 'relative', overflow: 'hidden', padding: '30px' }}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="chart-header" style={{ position: 'relative', zIndex: 5, display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h3 className="display-text neon-text-cyan" style={{ fontSize: '1.2rem', letterSpacing: '4px' }}>GLOBAL_THREAT_MONITOR</h3>
            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px' }}>SATELLITE_UPLINK: ACTIVE // ENCRYPTED_STREAM_22.9X</div>
          </div>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--neon-cyan)', textAlign: 'right' }}>
            LOC: 37.7749° N, 122.4194° W<br/>
            TIME: {new Date().toISOString()}
          </div>
        </div>

        {/* Map Background Decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15,
          backgroundImage: 'url("https://www.transparenttextures.com/patterns/world-map.png")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'invert(1) sepia(1) saturate(5) hue-rotate(175deg)'
        }} />

        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
           {[
             { top: '30%', left: '20%', label: 'NA_HQ' },
             { top: '45%', left: '55%', label: 'EU_CENTRAL' },
             { top: '65%', left: '80%', label: 'ASIA_HUB' },
             { top: '75%', left: '35%', label: 'SA_UNIT' },
             { top: '40%', left: '75%', label: 'PACIFIC_NET' }
           ].map(pt => (
             <motion.div 
               key={pt.label}
               initial={{ scale: 0 }}
               animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
               transition={{ duration: 4, repeat: Infinity, delay: Math.random() * 2 }}
               style={{
                 position: 'absolute', top: pt.top, left: pt.left,
                 width: '12px', height: '12px', borderRadius: '50%', background: 'var(--neon-cyan)',
                 boxShadow: '0 0 20px var(--neon-cyan)'
               }}
             >
                <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--neon-cyan)', marginTop: '18px', whiteSpace: 'nowrap', fontWeight: 800 }}>
                  {pt.label}::ONLINE
                </div>
             </motion.div>
           ))}
           
           <motion.div 
             animate={{ top: ['0%', '100%'] }}
             transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
             style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: 'rgba(0,243,255,0.3)', boxShadow: '0 0 15px var(--neon-cyan)' }}
           />
        </div>

        {/* Floating Data Feed */}
        <div style={{ position: 'absolute', right: '40px', bottom: '40px', width: '240px' }}>
           <div className="glass p-md mono" style={{ fontSize: '0.65rem', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.5)', borderRadius: '4px' }}>
              <div className="neon-text-cyan mb-xs" style={{ fontWeight: 800 }}>LIVE_INTEL_FEED:</div>
              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="mb-xs"
                style={{ color: 'var(--neon-green)' }}
              >
              &gt; INTERCEPTING_PKG_DATA_32...
              </motion.div>
              <div style={{ color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                &gt; SYNCING_MD5_HASH_ENCRYPT...<br/>
                &gt; TRACING_IP_ROUTE_192.168.1.1<br/>
                &gt; BYPASSING_LOCAL_FIREWALL...<br/>
                &gt; DECRYPTING_SECURE_NODE_99X...
              </div>
           </div>
        </div>
      </motion.div>

      {/* System Status Footer */}
      <div className="glass-card mt-xl mono" style={{ padding: '20px', borderLeft: '4px solid var(--neon-green)', background: 'rgba(0,255,102,0.03)' }}>
         <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', marginBottom: '10px', fontWeight: 800 }}>[ SYSTEM_STATUS_REPORT ]</div>
         <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', lineHeight: 1.8, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div>&gt; SYNC_STATE: <span style={{ color: 'var(--neon-green)' }}>SYNCHRONIZED</span></div>
            <div>&gt; THREAT_LEVEL: <span style={{ color: 'var(--neon-yellow)' }}>MODERATE</span></div>
            <div>&gt; UPLINK: <span style={{ color: 'var(--neon-cyan)' }}>STABLE</span></div>
            <div>&gt; MEM_LOAD: <span style={{ color: 'var(--neon-blue)' }}>42.4%</span></div>
            <div>&gt; DB_LATENCY: <span style={{ color: 'var(--neon-cyan)' }}>14ms</span></div>
            <div>&gt; SECURITY_GATE: <span style={{ color: 'var(--neon-green)' }}>ENABLED</span></div>
         </div>
      </div>
    </motion.div>
  );
}

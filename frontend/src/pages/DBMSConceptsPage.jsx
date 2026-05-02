import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

// Helper to simulate DB operation for visualization
const simulateOp = (type, sql) => {
  const socket = io(); // Connect to same host
  socket.emit('simulate_operation', {
    type,
    sql,
    timestamp: new Date().toISOString(),
    status: 'success'
  });
};

const ConceptCard = ({ title, sql, description, type = 'QUERY', highlight = false }) => (
  <motion.div 
    whileHover={{ y: -5, borderColor: highlight ? 'var(--neon-red)' : 'var(--neon-cyan)', boxShadow: `0 10px 30px ${highlight ? 'var(--neon-red)' : 'var(--neon-cyan)'}20` }}
    className="glass-card mb-md p-md interactive"
    style={{ 
      borderLeft: `4px solid ${highlight ? 'var(--neon-red)' : (type === 'QUERY' ? 'var(--neon-blue)' : 'var(--neon-purple)')}`,
      background: 'rgba(2, 11, 20, 0.6)',
      position: 'relative',
      overflow: 'hidden'
    }}
    onClick={() => simulateOp(type, sql)}
  >
    <div className="scan-line-overlay" style={{ opacity: 0.03, pointerEvents: 'none' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', itemsCenter: 'center', marginBottom: '12px' }}>
      <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', letterSpacing: '1px' }}>[{type}]</span>
      <button className="neon-btn neon-btn-sm neon-btn-primary" style={{ fontSize: '0.6rem', padding: '4px 8px' }}>[ RUN_SIM ]</button>
    </div>
    <h4 className="mono" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{title}</h4>
    <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '16px', lineHeight: 1.4 }}>{description}</p>
    <div className="mono" style={{ 
      padding: '10px', 
      background: 'rgba(0,0,0,0.4)', 
      borderRadius: '4px', 
      fontSize: '0.75rem', 
      color: 'var(--neon-cyan)', 
      border: '1px solid rgba(0,243,255,0.1)',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '4px', right: '8px', fontSize: '0.6rem', opacity: 0.3 }}>SQL</div>
      {sql}
    </div>
  </motion.div>
);

const MODULES = [
  { id: 1, title: 'MODULE 1 – DATABASE FUNDAMENTALS', content: (
    <div className="readable-mono">
       <h3 className="mono mb-xl" style={{ color: 'var(--neon-cyan)', fontSize: '1rem', letterSpacing: '2px' }}>&gt; CORE_BASICS</h3>
       <div className="grid-2" style={{ gap: '20px' }}>
          <ConceptCard 
            title="SCHEMA_DESIGN" 
            type="DDL"
            sql="DESCRIBE criminals;" 
            description="The deterministic blueprint of data organization within the core engine."
          />
          <ConceptCard 
            title="META_DATA_DICTIONARY" 
            type="META"
            sql="SELECT * FROM information_schema.tables;" 
            description="The global repository of structural definitions and relationships."
          />
       </div>
    </div>
  )},
  { 
    id: 2, 
    title: 'MODULE 2 – SQL + RELATIONAL MODEL', 
    highlight: 'VERY IMPORTANT',
    content: (
      <div className="readable-mono">
        <h3 className="mono mb-xl" style={{ color: 'var(--neon-cyan)', fontSize: '1rem', letterSpacing: '2px' }}>&gt; COMMAND_SYNTAX_CORE</h3>
        
        <div className="grid-2" style={{ gap: '20px' }}>
           <ConceptCard 
              title="CREATE_TABLE_OP" 
              type="DDL"
              sql="CREATE TABLE targets (id INT PRIMARY KEY, alias TEXT);" 
              description="Initializes a new relational entity within the persistent storage layer."
           />
           <ConceptCard 
              title="DATA_INSERTION" 
              type="DML"
              sql="INSERT INTO targets (alias) VALUES ('GHOST');" 
              description="Populates specified relation with new atomic data records."
           />
           <ConceptCard 
              title="RECORD_MUTATION" 
              type="DML"
              sql="UPDATE targets SET status = 'CAPTURED' WHERE id = 7;" 
              description="Executes in-place modification of existing relation tuples."
           />
           <ConceptCard 
              title="DATA_PURGE" 
              type="DML"
              sql="DELETE FROM targets WHERE threat_level = 0;" 
              description="Deterministic removal of records (Auth Gateway Required)."
           />
        </div>

        <h3 className="mono mt-2xl mb-xl" style={{ color: 'var(--neon-blue)', fontSize: '1rem', letterSpacing: '2px' }}>&gt; RELATIONAL_JOIN_ALGORITHMS</h3>
        <div className="grid-2" style={{ gap: '20px' }}>
           <ConceptCard 
              title="INNER_EQUIJOIN" 
              sql="SELECT * FROM cases JOIN criminals ON cases.id = criminals.cid;" 
              description="Intersection of two relations based on predicate matching."
           />
           <ConceptCard 
              title="LEFT_OUTER_JOIN" 
              sql="SELECT * FROM cases LEFT JOIN evidence ON cases.id = e.case_id;" 
              description="Preserves left relation integrity while mapping right-side matches."
           />
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: 'MODULE 3 – ADVANCED SQL + NORMALIZATION',
    highlight: 'EXAM HOTSPOT',
    content: (
      <div className="readable-mono">
        <h3 className="mono mb-xl" style={{ color: 'var(--neon-cyan)', fontSize: '1rem', letterSpacing: '2px' }}>&gt; COMPLEX_LOGIC_OPERATIONS</h3>
        <div className="grid-2" style={{ gap: '20px' }}>
           <ConceptCard 
              title="NESTED_SUBQUERIES" 
              sql="SELECT name FROM criminals WHERE id IN (SELECT cid FROM cases);" 
              description="High-order set operations using inner-loop filtering."
           />
           <ConceptCard 
              title="VIRTUAL_ABSTRACTION" 
              type="DDL"
              sql="CREATE VIEW intel_summary AS SELECT ... FROM ..." 
              description="Computed relations for restricted access and logical simplification."
           />
        </div>

        <h3 className="mono mt-2xl mb-xl" style={{ color: 'var(--neon-cyan)', fontSize: '1rem', letterSpacing: '2px' }}>&gt; AGGREGATE_HEURISTICS</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
           {['COUNT()', 'SUM()', 'AVG()', 'MAX()', 'MIN()'].map(f => (
             <motion.div 
               key={f} 
               whileHover={{ scale: 1.1, borderColor: 'var(--neon-cyan)', background: 'rgba(0,243,255,0.1)' }}
               className="glass mono" 
               style={{ 
                 padding: '10px 20px', cursor: 'pointer', border: '1px solid var(--border-subtle)',
                 fontSize: '0.8rem', color: 'var(--neon-cyan)', borderRadius: '4px'
               }}
               onClick={() => simulateOp('AGGREGATE', `SELECT ${f} FROM data_stream`)}
             >
                {f}
             </motion.div>
           ))}
        </div>

        <h3 className="mono mt-2xl mb-xl" style={{ color: 'var(--neon-red)', fontSize: '1.1rem', letterSpacing: '2px' }}>🔥 NORMALIZATION_ENGINE</h3>
        <div className="glass p-xl mb-md" style={{ borderLeft: '4px solid var(--neon-red)', background: 'rgba(255,42,42,0.03)' }}>
           <p className="mono text-xs mb-md" style={{ color: 'var(--text-tertiary)' }}>DECOMPOSITION PROTOCOL: REDUCING REDUNDANCY // ENSURING INTEGRITY</p>
           <ul className="mono text-sm" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <li><strong style={{ color: 'var(--neon-yellow)' }}>1NF:</strong> ATOMIC_VALUES_ONLY // NO_REPEATING_VECTORS</li>
              <li><strong style={{ color: 'var(--neon-yellow)' }}>2NF:</strong> 1NF_COMPLIANT // NO_PARTIAL_DEPENDENCIES</li>
              <li><strong style={{ color: 'var(--neon-yellow)' }}>3NF:</strong> 2NF_COMPLIANT // NO_TRANSITIVE_DEPENDENCIES</li>
              <li><strong style={{ color: 'var(--neon-yellow)' }}>BCNF:</strong> STRONG_3NF // FOR EVERY X-&gt;Y, X IS SUPER_KEY</li>
           </ul>
        </div>
        <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px' }}>
           &gt;&gt; FOCUS: DECOMPOSITION LOSSLESSNESS & FUNCTIONAL DEPENDENCY PRESERVATION
        </div>
      </div>
    )
  }
];

export default function DBMSConceptsPage() {
  const [activeId, setActiveId] = useState(2);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} style={{ padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-cyan)', boxShadow: '0 0 15px var(--neon-cyan)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', letterSpacing: '6px' }}>
              DBMS_<span style={{ color: 'var(--neon-cyan)' }}>ARCHIVES</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              INTERACTIVE KNOWLEDGE BASE // CORE DATABASE THEORY
            </p>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '30px', height: 'calc(100vh - 220px)' }}>
        {/* Module Selector */}
        <div className="glass-card" style={{ padding: '20px', overflowY: 'auto', background: 'rgba(2, 11, 20, 0.4)' }}>
          <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
             [ SYSTEM_CURRICULUM_v4.5 ]
          </div>
          {MODULES.map(m => (
            <motion.div
              key={m.id}
              whileHover={{ x: 5 }}
              onClick={() => setActiveId(m.id)}
              className="cursor-pointer"
              style={{
                padding: '20px',
                marginBottom: '10px',
                borderRadius: '4px',
                borderLeft: activeId === m.id ? '4px solid var(--neon-cyan)' : '4px solid transparent',
                background: activeId === m.id ? 'rgba(0,243,255,0.08)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                 <div className="mono" style={{ fontSize: '0.65rem', color: activeId === m.id ? 'var(--neon-cyan)' : 'var(--text-tertiary)' }}>UNIT_0{m.id}</div>
                 <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--neon-green)', opacity: activeId === m.id ? 1 : 0.4 }}>[ DATA_SYNCED ]</div>
              </div>
              <div className="mono" style={{ fontSize: '0.85rem', fontWeight: 800, color: activeId === m.id ? '#fff' : 'var(--text-secondary)' }}>{m.title}</div>
              {m.highlight && (
                 <div className="mono" style={{ fontSize: '0.6rem', color: 'var(--neon-red)', marginTop: '8px', letterSpacing: '1px' }}>» {m.highlight}</div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="glass-card hud-brackets" style={{ padding: '40px', overflowY: 'auto', position: 'relative', background: 'rgba(2, 11, 20, 0.6)' }}>
          <div className="scan-line-overlay" style={{ opacity: 0.03 }} />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 className="display-text" style={{ fontSize: '1.4rem', color: 'var(--neon-cyan)', letterSpacing: '4px' }}>{MODULES.find(m => m.id === activeId).title}</h2>
                <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>UNIT_{activeId} // KNOWLEDGE_STREAM</div>
              </div>

              {MODULES.find(m => m.id === activeId).content ? (
                MODULES.find(m => m.id === activeId).content
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', opacity: 0.3 }}>
                  <div style={{ fontSize: '4rem' }}>🔒</div>
                  <p className="mono" style={{ marginTop: '20px' }}>ACCESS_DENIED // MODULE_CONTENT_ENCRYPTED</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

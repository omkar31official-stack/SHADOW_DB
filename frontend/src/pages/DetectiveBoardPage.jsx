import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import HoloTerminal from '../components/HoloTerminal';
import HoloBoard from '../components/HoloBoard';

const NODE_COLORS = {
  criminal: { bg: 'rgba(255,23,68,0.15)', border: 'var(--neon-red)', text: 'var(--neon-red)' },
  case: { bg: 'rgba(0,184,255,0.15)', border: 'var(--neon-blue)', text: 'var(--neon-blue)' },
  evidence: { bg: 'rgba(0,255,213,0.12)', border: 'var(--neon-cyan)', text: 'var(--neon-cyan)' },
  officer: { bg: 'rgba(168,85,247,0.12)', border: 'var(--neon-purple)', text: 'var(--neon-purple)' },
};

const EMPTY_ARRAY = [];

export default function DetectiveBoardPage() {
  const { data: criminalsData } = useApi('/criminals');
  const { data: casesData } = useApi('/cases');
  const { data: assignmentsData } = useApi('/assignments');
  const { data: evidenceData } = useApi('/evidence');

  const criminals = criminalsData?.data || EMPTY_ARRAY;
  const cases = casesData?.data || EMPTY_ARRAY;
  const assignments = assignmentsData?.data || EMPTY_ARRAY;
  const evidence = evidenceData?.data || EMPTY_ARRAY;

  const [nodes, setNodes] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [holoView, setHoloView] = useState(null);
  const boardRef = useRef(null);
  const nodesBuilt = useRef(false);

  const dataKey = useMemo(() => {
    return `${criminals.length}-${cases.length}-${evidence.length}`;
  }, [criminals.length, cases.length, evidence.length]);

  useEffect(() => {
    if (criminals.length === 0 && cases.length === 0 && evidence.length === 0) {
      if (!nodesBuilt.current) {
        setNodes([]);
        nodesBuilt.current = true;
      }
      return;
    }

    const builtNodes = [];
    const cols = 4;
    const spacingX = 220;
    const spacingY = 180;
    const startX = 60;
    const startY = 60;

    criminals.forEach((c, i) => {
      builtNodes.push({
        id: `criminal-${c.id}`, type: 'criminal', data: c,
        label: `${c.first_name} ${c.last_name}`, sub: c.alias || c.status,
        x: startX + (i % cols) * spacingX, y: startY + Math.floor(i / cols) * spacingY,
      });
    });

    cases.forEach((c, i) => {
      builtNodes.push({
        id: `case-${c.id}`, type: 'case', data: c,
        label: c.case_number, sub: c.title,
        x: startX + (i % cols) * spacingX, y: startY + (Math.ceil(criminals.length / cols) + Math.floor(i / cols)) * spacingY + 60,
      });
    });

    evidence.forEach((e, i) => {
      builtNodes.push({
        id: `evidence-${e.id}`, type: 'evidence', data: e,
        label: `EVD-${e.id}`, sub: e.type,
        x: startX + (i % cols) * spacingX + 80, y: startY + (Math.ceil(criminals.length / cols) + Math.ceil(cases.length / cols) + Math.floor(i / cols)) * spacingY + 100,
      });
    });

    setNodes(builtNodes);
    nodesBuilt.current = true;
  }, [dataKey]);

  const connections = useMemo(() => {
    const conns = [];
    assignments.forEach(a => {
      if (a.criminal_id) conns.push({ from: `criminal-${a.criminal_id}`, to: `case-${a.case_id}`, label: a.role });
    });
    evidence.forEach(e => {
      if (e.case_id) conns.push({ from: `evidence-${e.id}`, to: `case-${e.case_id}`, label: 'evidence' });
    });
    return conns;
  }, [assignments, evidence]);

  const [mouseDownPos, setMouseDownPos] = useState(null);

  const handleMouseDown = (e, node) => {
    e.stopPropagation();
    const rect = boardRef.current.getBoundingClientRect();
    setDragging(node.id);
    setMouseDownPos({ x: e.clientX, y: e.clientY });
    setOffset({ x: e.clientX - rect.left - node.x, y: e.clientY - rect.top - node.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    setNodes(prev => prev.map(n =>
      n.id === dragging ? { ...n, x: e.clientX - rect.left - offset.x, y: e.clientY - rect.top - offset.y } : n
    ));
  }, [dragging, offset]);

  const handleMouseUp = (e, node) => {
    if (dragging && mouseDownPos) {
      const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
      if (dist < 5) {
        setHoloView(node);
      }
    }
    setDragging(null);
    setMouseDownPos(null);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      const onUp = () => setDragging(null);
      window.addEventListener('mouseup', onUp);
      return () => { 
        window.removeEventListener('mousemove', handleMouseMove); 
        window.removeEventListener('mouseup', onUp);
      };
    }
  }, [dragging, handleMouseMove]);

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
      <div className="page-header" style={{ marginBottom: '30px' }}>
        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ width: '4px', height: '40px', background: 'var(--neon-red)', boxShadow: '0 0 15px var(--neon-red)' }} />
          <div>
            <h1 className="display-text" style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', letterSpacing: '4px' }}>
              DETECTIVE_<span style={{ color: 'var(--neon-red)' }}>BOARD</span>
            </h1>
            <p className="mono" style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', letterSpacing: '2px', marginTop: '4px' }}>
              INTERACTIVE EVIDENCE LINKING // THREAT_TOPOLOGY_MAP
            </p>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {holoView && (
          holoView.type === 'criminal' ? (
            <HoloBoard criminal={holoView.data} onClose={() => setHoloView(null)} />
          ) : (
            <HoloTerminal type={holoView.type} data={holoView.data} onClose={() => setHoloView(null)} />
          )
        )}
      </AnimatePresence>

      <div className="board-container glass" style={{
        flex: 1, position: 'relative', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)', background: '#0b0e14',
        overflow: 'auto'
      }}>
        <div ref={boardRef} style={{
          position: 'relative', width: '2000px', height: '2000px',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)',
          cursor: dragging ? 'grabbing' : 'default',
        }}>
          {/* Connection strings with shadow */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5"/>
            </filter>
            {connections.map((conn, i) => {
              const from = getNode(conn.from);
              const to = getNode(conn.to);
              if (!from || !to) return null;
              const x1 = from.x + (from.type === 'criminal' ? 70 : 80); 
              const y1 = from.y + (from.type === 'criminal' ? 70 : 40);
              const x2 = to.x + (to.type === 'criminal' ? 70 : 80); 
              const y2 = to.y + (to.type === 'criminal' ? 70 : 40);
              return (
                <g key={i}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#ff1744" strokeWidth="2" strokeOpacity="0.8"
                    strokeDasharray="6 4"
                    filter="url(#shadow)" />
                  <circle cx={x1} cy={y1} r="3" fill="#ff1744" />
                  <circle cx={x2} cy={y2} r="3" fill="#ff1744" />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => {
            const color = NODE_COLORS[node.type] || NODE_COLORS.criminal;
            const isCriminal = node.type === 'criminal';
            
            return (
              <motion.div
                key={node.id}
                initial={{ scale: 0, opacity: 0, rotate: (Math.random() * 10 - 5) }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: 'absolute', left: node.x, top: node.y,
                  width: isCriminal ? '140px' : '160px',
                  padding: isCriminal ? '8px 8px 30px 8px' : '15px',
                  background: isCriminal ? 'rgba(2, 11, 20, 0.8)' : node.type === 'case' ? 'rgba(0, 184, 255, 0.1)' : 'rgba(0, 255, 213, 0.05)',
                  border: isCriminal ? '1px solid var(--border-subtle)' : `1px solid ${color.border}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: dragging === node.id ? 'grabbing' : 'grab',
                  zIndex: dragging === node.id ? 100 : 10,
                  boxShadow: dragging === node.id ? '0 15px 35px rgba(0,0,0,0.5)' : '0 5px 15px rgba(0,0,0,0.3)',
                  transform: `rotate(${isCriminal ? (node.data.id * 7 % 10 - 5) : 0}deg)`,
                  backdropFilter: isCriminal ? 'none' : 'blur(10px)',
                }}
                onMouseDown={(e) => handleMouseDown(e, node)}
                onMouseUp={(e) => handleMouseUp(e, node)}
              >
                {/* Digital Node Indicator */}
                <div style={{
                  position: 'absolute', top: '-6px', left: '50%', transform: 'translateX(-50%)',
                  width: '12px', height: '12px', background: isCriminal ? 'var(--neon-red)' : 'var(--neon-cyan)',
                  borderRadius: '2px', boxShadow: `0 0 10px ${isCriminal ? 'var(--neon-red)' : 'var(--neon-cyan)'}`, zIndex: 5,
                  rotate: '45deg'
                }} />

                {isCriminal ? (
                  <>
                    <div style={{
                      width: '100%', height: '120px', background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', border: '1px solid var(--border-subtle)',
                      position: 'relative'
                    }}>
                      <div className="scan-line-overlay" style={{ opacity: 0.1 }} />
                      <div style={{ position: 'absolute', top: 5, left: 5, fontSize: '0.5rem', color: 'var(--neon-red)', opacity: 0.5 }}>ID: {node.data.id}</div>
                      <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 10px var(--neon-red-glow))' }}>👤</span>
                      
                      {/* Corner Brackets Internal */}
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', borderLeft: '1px solid var(--neon-red)', borderTop: '1px solid var(--neon-red)' }} />
                      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRight: '1px solid var(--neon-red)', borderBottom: '1px solid var(--neon-red)' }} />
                    </div>
                    <div style={{ 
                      marginTop: '12px', fontFamily: 'var(--font-mono)', 
                      color: 'var(--neon-red)', fontSize: '0.8rem', textAlign: 'center', fontWeight: 'bold',
                      letterSpacing: '1px', textTransform: 'uppercase'
                    }}>
                      {node.label}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      [ STATUS: {node.sub.toUpperCase()} ]
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.7rem', color: color.text, fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {node.type === 'case' ? '📁 CASE_FILE' : '🔬 EVIDENCE'}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>{node.label}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.4, fontFamily: 'var(--font-mono)' }}>{node.sub}</div>
                    
                    {/* Document Clip Decorator */}
                    {node.type === 'case' && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', width: '20px', height: '6px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} />
                    )}
                  </>
                )}
              </motion.div>
            );
          })}

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="empty-state" style={{ height: '100%' }}>
              <div className="empty-state-icon">🕵️</div>
              <div className="empty-state-text">Add criminals and cases to populate the detective board</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

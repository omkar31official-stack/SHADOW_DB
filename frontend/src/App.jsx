import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSocket } from './hooks/useSocket';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import VisualizationPanel from './components/layout/VisualizationPanel';
import Dashboard from './pages/Dashboard';
import CriminalsPage from './pages/CriminalsPage';
import CasesPage from './pages/CasesPage';
import EvidencePage from './pages/EvidencePage';
import OfficersPage from './pages/OfficersPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DetectiveBoardPage from './pages/DetectiveBoardPage';
import DBExplorerPage from './pages/DBExplorerPage';
import DBMSConceptsPage from './pages/DBMSConceptsPage';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, scale: 1.02, filter: 'blur(10px)', transition: { duration: 0.2 } },
};

function AnimatedRoutes({ socket }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/criminals" element={<CriminalsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/evidence" element={<EvidencePage />} />
          <Route path="/officers" element={<OfficersPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/detective-board" element={<DetectiveBoardPage />} />
          <Route path="/db-explorer" element={<DBExplorerPage />} />
          <Route path="/concepts" element={<DBMSConceptsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const socket = useSocket();

  return (
    <Router>
      <div className="app-layout">
        {/* Ambient background effects */}
        <div className="ambient-bg" />
        <div className="scan-line-overlay" />

        {/* Top: Full-Width Header */}
        <Header connected={socket.connected} />

        {/* Bottom Area: Sidebar + Main + VizPanel */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left: Sidebar Navigation */}
          <Sidebar />

          {/* Center: Main Content */}
          <main className="main-content">
            <AnimatedRoutes socket={socket} />
          </main>

          {/* Right: Visualization Panel (Always On) */}
          <VisualizationPanel socket={socket} />

        </div>
      </div>
    </Router>
  );
}

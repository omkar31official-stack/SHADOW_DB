const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// Overview stats
router.get('/overview', async (req, res) => {
  try {
    const { rows: totalCriminals } = await query('SELECT COUNT(*) as count FROM criminals', [], { operation: 'Analytics: Total Criminals' });
    const { rows: wantedCriminals } = await query("SELECT COUNT(*) as count FROM criminals WHERE status = 'wanted'", [], { operation: 'Analytics: Wanted Count' });
    const { rows: criticalCriminals } = await query("SELECT COUNT(*) as count FROM criminals WHERE danger_level = 'critical'", [], { operation: 'Analytics: Critical Criminals' });
    const { rows: totalCases } = await query('SELECT COUNT(*) as count FROM cases', [], { operation: 'Analytics: Total Cases' });
    const { rows: activeCases } = await query("SELECT COUNT(*) as count FROM cases WHERE status IN ('open', 'investigating')", [], { operation: 'Analytics: Active Cases' });
    const { rows: investigatingCases } = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'investigating'", [], { operation: 'Analytics: Investigating Cases' });
    const { rows: closedCases } = await query("SELECT COUNT(*) as count FROM cases WHERE status = 'closed'", [], { operation: 'Analytics: Closed Cases' });
    const { rows: totalEvidence } = await query('SELECT COUNT(*) as count FROM evidence', [], { operation: 'Analytics: Total Evidence' });
    const { rows: totalOfficers } = await query('SELECT COUNT(*) as count FROM officers', [], { operation: 'Analytics: Total Officers' });
    const { rows: recentCriminals } = await query('SELECT id, first_name, last_name, alias, status, created_at FROM criminals ORDER BY created_at DESC LIMIT 5', [], { operation: 'Analytics: Recent Criminals' });

    res.json({
      totalCriminals: totalCriminals[0].count,
      wantedCriminals: wantedCriminals[0].count,
      criticalCriminals: criticalCriminals[0].count,
      totalCases: totalCases[0].count,
      activeCases: activeCases[0].count,
      investigatingCases: investigatingCases[0].count,
      closedCases: closedCases[0].count,
      totalEvidence: totalEvidence[0].count,
      totalOfficers: totalOfficers[0].count,
      recentCriminals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crime type distribution
router.get('/crime-types', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT crime_type, COUNT(*) as count FROM cases GROUP BY crime_type ORDER BY count DESC',
      [],
      { operation: 'Analytics: Crime Type Distribution' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Case status distribution
router.get('/case-status', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT status, COUNT(*) as count FROM cases GROUP BY status',
      [],
      { operation: 'Analytics: Case Status Distribution' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Alias for frontend compatibility
router.get('/status-distribution', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT status, COUNT(*) as count FROM cases GROUP BY status',
      [],
      { operation: 'Analytics: Status Distribution' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Danger level distribution
router.get('/danger-levels', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT danger_level, COUNT(*) as count FROM criminals GROUP BY danger_level ORDER BY FIELD(danger_level, "critical", "high", "medium", "low")',
      [],
      { operation: 'Analytics: Danger Level Distribution' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Most wanted criminals
router.get('/most-wanted', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT cr.*, COUNT(ca.case_id) as case_count 
       FROM criminals cr 
       LEFT JOIN case_assignments ca ON cr.id = ca.criminal_id AND ca.role = 'suspect'
       WHERE cr.status = 'wanted' AND cr.danger_level IN ('high', 'critical')
       GROUP BY cr.id
       ORDER BY FIELD(cr.danger_level, 'critical', 'high') , case_count DESC
       LIMIT 5`,
      [],
      { operation: 'Analytics: Most Wanted', joinType: 'LEFT JOIN + GROUP BY' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Timeline data (cases over time)
router.get('/timeline', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT DATE_FORMAT(occurred_at, '%Y-%m') as month, COUNT(*) as count, crime_type
       FROM cases WHERE occurred_at IS NOT NULL
       GROUP BY month, crime_type ORDER BY month`,
      [],
      { operation: 'Analytics: Crime Timeline' }
    );
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recent activity
router.get('/recent-activity', async (req, res) => {
  try {
    const { rows: recentCriminals } = await query(
      `SELECT id, first_name, last_name, alias, status, danger_level, created_at, 'criminal' as entity_type FROM criminals ORDER BY created_at DESC LIMIT 5`
    );
    const { rows: recentCases } = await query(
      `SELECT id, case_number, title, status, priority, created_at, 'case' as entity_type FROM cases ORDER BY created_at DESC LIMIT 5`
    );
    
    const combined = [...recentCriminals, ...recentCases]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    res.json({ data: combined });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

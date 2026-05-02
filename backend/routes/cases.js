const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all cases
router.get('/', async (req, res) => {
  try {
    const { search, status, crime_type, priority } = req.query;
    let sql = 'SELECT * FROM cases WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR case_number LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (crime_type) { sql += ' AND crime_type = ?'; params.push(crime_type); }
    if (priority) { sql += ' AND priority = ?'; params.push(priority); }

    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params, { operation: 'List Cases' });
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single case with full details (demonstrates multiple JOINs)
router.get('/:id', async (req, res) => {
  try {
    const { rows: caseData } = await query(
      'SELECT * FROM cases WHERE id = ?',
      [req.params.id],
      { operation: 'Get Case Details' }
    );

    if (caseData.length === 0) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Get suspects (LEFT JOIN)
    const { rows: suspects } = await query(
      `SELECT cr.*, ca.role, ca.notes as assignment_notes
       FROM criminals cr
       LEFT JOIN case_assignments ca ON cr.id = ca.criminal_id
       WHERE ca.case_id = ? AND ca.role = 'suspect'`,
      [req.params.id],
      { operation: 'LEFT JOIN: Case → Suspects', joinType: 'LEFT JOIN' }
    );

    // Get investigators
    const { rows: investigators } = await query(
      `SELECT o.*, ca.role, ca.notes as assignment_notes
       FROM officers o
       INNER JOIN case_assignments ca ON o.id = ca.officer_id
       WHERE ca.case_id = ? AND ca.role = 'investigator'`,
      [req.params.id],
      { operation: 'INNER JOIN: Case → Officers', joinType: 'INNER JOIN' }
    );

    // Get evidence
    const { rows: evidence } = await query(
      `SELECT e.*, o.first_name as collector_first, o.last_name as collector_last
       FROM evidence e
       LEFT JOIN officers o ON e.collected_by = o.id
       WHERE e.case_id = ?`,
      [req.params.id],
      { operation: 'LEFT JOIN: Evidence → Officers', joinType: 'LEFT JOIN' }
    );

    res.json({
      ...caseData[0],
      suspects,
      investigators,
      evidence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create case
router.post('/', async (req, res) => {
  try {
    const { case_number, title, description, crime_type, status, priority, location, occurred_at } = req.body;
    
    const caseNum = case_number || `SDB-${Date.now().toString(36).toUpperCase()}`;
    
    const { rows: result } = await query(
      `INSERT INTO cases (case_number, title, description, crime_type, status, priority, location, occurred_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [caseNum, title, description, crime_type || 'Other', status || 'open', priority || 'medium', location, occurred_at || null],
      { operation: 'Create New Case' }
    );

    const { rows: newCase } = await query('SELECT * FROM cases WHERE id = ?', [result.insertId]);
    res.status(201).json(newCase[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update case
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(fields)) {
      if (key !== 'id' && key !== 'created_at') {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    params.push(req.params.id);
    await query(
      `UPDATE cases SET ${setClauses.join(', ')} WHERE id = ?`,
      params,
      { operation: 'Update Case' }
    );

    const { rows } = await query('SELECT * FROM cases WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE case
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM cases WHERE id = ?', [req.params.id], { operation: 'Delete Case' });
    res.json({ message: 'Case deleted', id: parseInt(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

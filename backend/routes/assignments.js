const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all assignments for a case
router.get('/', async (req, res) => {
  try {
    const { case_id, criminal_id } = req.query;
    let sql = `SELECT ca.*, 
               c.case_number, c.title as case_title,
               cr.first_name as criminal_first, cr.last_name as criminal_last, cr.alias as criminal_alias,
               o.first_name as officer_first, o.last_name as officer_last, o.badge_number
               FROM case_assignments ca
               LEFT JOIN cases c ON ca.case_id = c.id
               LEFT JOIN criminals cr ON ca.criminal_id = cr.id
               LEFT JOIN officers o ON ca.officer_id = o.id
               WHERE 1=1`;
    const params = [];

    if (case_id) { sql += ' AND ca.case_id = ?'; params.push(case_id); }
    if (criminal_id) { sql += ' AND ca.criminal_id = ?'; params.push(criminal_id); }

    sql += ' ORDER BY ca.assigned_at DESC';
    const { rows } = await query(sql, params, { operation: 'List Assignments', joinType: 'Multiple LEFT JOINs (M:N)' });
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create assignment
router.post('/', async (req, res) => {
  try {
    const { case_id, criminal_id, officer_id, role, notes } = req.body;
    const { rows: result } = await query(
      `INSERT INTO case_assignments (case_id, criminal_id, officer_id, role, notes) VALUES (?, ?, ?, ?, ?)`,
      [case_id, criminal_id || null, officer_id || null, role || 'suspect', notes],
      { operation: 'Create Assignment (M:N Link)' }
    );
    const { rows } = await query('SELECT * FROM case_assignments WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE assignment
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM case_assignments WHERE id = ?', [req.params.id], { operation: 'Remove Assignment' });
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

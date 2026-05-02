const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all officers
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM officers ORDER BY rank_title, last_name', [], { operation: 'List Officers' });
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single officer with assignments
router.get('/:id', async (req, res) => {
  try {
    const { rows: officer } = await query('SELECT * FROM officers WHERE id = ?', [req.params.id], { operation: 'Get Officer Details' });
    if (officer.length === 0) return res.status(404).json({ error: 'Officer not found' });

    const { rows: assignments } = await query(
      `SELECT ca.*, c.title as case_title, c.case_number, c.status as case_status,
              cr.first_name as criminal_first, cr.last_name as criminal_last
       FROM case_assignments ca
       INNER JOIN cases c ON ca.case_id = c.id  
       LEFT JOIN criminals cr ON ca.criminal_id = cr.id
       WHERE ca.officer_id = ?`,
      [req.params.id],
      { operation: 'JOIN: Officer → Assignments', joinType: 'INNER + LEFT JOIN' }
    );

    res.json({ ...officer[0], assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create officer
router.post('/', async (req, res) => {
  try {
    const { badge_number, first_name, last_name, rank_title, department, phone, email, status } = req.body;
    const { rows: result } = await query(
      `INSERT INTO officers (badge_number, first_name, last_name, rank_title, department, phone, email, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [badge_number, first_name, last_name, rank_title || 'Officer', department, phone, email, status || 'active'],
      { operation: 'Add Officer' }
    );
    const { rows } = await query('SELECT * FROM officers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update officer
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const set = [], params = [];
    for (const [k, v] of Object.entries(fields)) {
      if (k !== 'id' && k !== 'created_at') { set.push(`${k} = ?`); params.push(v); }
    }
    params.push(req.params.id);
    await query(`UPDATE officers SET ${set.join(', ')} WHERE id = ?`, params, { operation: 'Update Officer' });
    const { rows } = await query('SELECT * FROM officers WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE officer
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM officers WHERE id = ?', [req.params.id], { operation: 'Delete Officer' });
    res.json({ message: 'Officer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { query } = require('../db/connection');

// GET all criminals with search/filter/pagination
router.get('/', async (req, res) => {
  try {
    const { search, status, danger_level, page = 1, limit = 50 } = req.query;
    let sql = 'SELECT * FROM criminals WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR alias LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (danger_level) {
      sql += ' AND danger_level = ?';
      params.push(danger_level);
    }

    sql += ' ORDER BY created_at DESC';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const { rows } = await query(sql, params, { operation: 'List Criminals' });

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM criminals WHERE 1=1';
    const countParams = [];
    if (search) {
      countSql += ' AND (first_name LIKE ? OR last_name LIKE ? OR alias LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (status) { countSql += ' AND status = ?'; countParams.push(status); }
    if (danger_level) { countSql += ' AND danger_level = ?'; countParams.push(danger_level); }
    
    const { rows: countRows } = await query(countSql, countParams);

    res.json({
      data: rows,
      total: countRows[0].total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single criminal with related cases and evidence (demonstrates JOINs)
router.get('/:id', async (req, res) => {
  try {
    const { rows: criminal } = await query(
      'SELECT * FROM criminals WHERE id = ?', 
      [req.params.id],
      { operation: 'Get Criminal Details' }
    );
    
    if (criminal.length === 0) {
      return res.status(404).json({ error: 'Criminal not found' });
    }

    // Get related cases via INNER JOIN through case_assignments
    const { rows: cases } = await query(
      `SELECT c.*, ca.role, ca.notes as assignment_notes 
       FROM cases c 
       INNER JOIN case_assignments ca ON c.id = ca.case_id 
       WHERE ca.criminal_id = ?`,
      [req.params.id],
      { operation: 'JOIN: Criminal → Cases', joinType: 'INNER JOIN' }
    );

    // Get related evidence via LEFT JOIN
    const { rows: evidence } = await query(
      `SELECT e.* FROM evidence e
       INNER JOIN cases c ON e.case_id = c.id
       INNER JOIN case_assignments ca ON c.id = ca.case_id
       WHERE ca.criminal_id = ?`,
      [req.params.id],
      { operation: 'JOIN: Criminal → Evidence', joinType: 'INNER JOIN (chained)' }
    );

    // Get associated officers
    const { rows: officers } = await query(
      `SELECT DISTINCT o.*, ca.role as assignment_role FROM officers o
       INNER JOIN case_assignments ca ON o.id = ca.officer_id
       WHERE ca.case_id IN (
         SELECT case_id FROM case_assignments WHERE criminal_id = ?
       )`,
      [req.params.id],
      { operation: 'JOIN: Criminal → Officers', joinType: 'INNER JOIN + Subquery' }
    );

    res.json({
      ...criminal[0],
      cases,
      evidence,
      officers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create criminal
router.post('/', async (req, res) => {
  try {
    const {
      first_name, last_name, alias, date_of_birth, gender,
      height_cm, weight_kg, eye_color, hair_color,
      nationality, address, photo_url, fingerprint_id,
      status, danger_level, description
    } = req.body;

    const { rows: result } = await query(
      `INSERT INTO criminals (first_name, last_name, alias, date_of_birth, gender, height_cm, weight_kg, eye_color, hair_color, nationality, address, photo_url, fingerprint_id, status, danger_level, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, alias, date_of_birth || null, gender || 'Male', height_cm || null, weight_kg || null, eye_color, hair_color, nationality, address, photo_url, fingerprint_id, status || 'wanted', danger_level || 'medium', description],
      { operation: 'Add Criminal Record' }
    );

    const { rows: newCriminal } = await query(
      'SELECT * FROM criminals WHERE id = ?', [result.insertId]
    );

    res.status(201).json(newCriminal[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update criminal
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

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);
    await query(
      `UPDATE criminals SET ${setClauses.join(', ')} WHERE id = ?`,
      params,
      { operation: 'Update Criminal Record' }
    );

    const { rows } = await query('SELECT * FROM criminals WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE criminal
router.delete('/:id', async (req, res) => {
  try {
    await query(
      'DELETE FROM criminals WHERE id = ?',
      [req.params.id],
      { operation: 'Delete Criminal Record' }
    );
    res.json({ message: 'Criminal record deleted', id: parseInt(req.params.id) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

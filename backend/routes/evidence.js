const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../db/connection');

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evidence-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.mp4', '.mp3'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// GET all evidence
router.get('/', async (req, res) => {
  try {
    const { case_id, type } = req.query;
    let sql = `SELECT e.*, c.case_number, c.title as case_title,
               o.first_name as collector_first, o.last_name as collector_last
               FROM evidence e
               LEFT JOIN cases c ON e.case_id = c.id
               LEFT JOIN officers o ON e.collected_by = o.id WHERE 1=1`;
    const params = [];

    if (case_id) { sql += ' AND e.case_id = ?'; params.push(case_id); }
    if (type) { sql += ' AND e.type = ?'; params.push(type); }

    sql += ' ORDER BY e.created_at DESC';
    const { rows } = await query(sql, params, { operation: 'List Evidence', joinType: 'LEFT JOIN' });
    res.json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single evidence
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT e.*, c.case_number, c.title as case_title 
       FROM evidence e LEFT JOIN cases c ON e.case_id = c.id WHERE e.id = ?`,
      [req.params.id],
      { operation: 'Get Evidence Details' }
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Evidence not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create evidence (with optional file upload)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { case_id, type, description, location_found, collected_by, chain_of_custody } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;

    const { rows: result } = await query(
      `INSERT INTO evidence (case_id, type, description, file_url, location_found, collected_by, chain_of_custody)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [case_id, type || 'physical', description, file_url, location_found, collected_by || null, chain_of_custody],
      { operation: 'Add Evidence' }
    );

    const { rows } = await query('SELECT * FROM evidence WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update evidence
router.put('/:id', async (req, res) => {
  try {
    const fields = req.body;
    const set = [], params = [];
    for (const [k, v] of Object.entries(fields)) {
      if (k !== 'id' && k !== 'created_at') { set.push(`${k} = ?`); params.push(v); }
    }
    params.push(req.params.id);
    await query(`UPDATE evidence SET ${set.join(', ')} WHERE id = ?`, params, { operation: 'Update Evidence' });
    const { rows } = await query('SELECT * FROM evidence WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE evidence
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM evidence WHERE id = ?', [req.params.id], { operation: 'Delete Evidence' });
    res.json({ message: 'Evidence deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

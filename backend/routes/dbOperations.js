const express = require('express');
const router = express.Router();
const { query, transaction } = require('../db/connection');

// GET database schema info
router.get('/schema', async (req, res) => {
  try {
    const tables = ['criminals', 'cases', 'officers', 'evidence', 'case_assignments'];
    const schema = [];

    for (const table of tables) {
      const { rows: columns } = await query(
        `SELECT COLUMN_NAME, COLUMN_TYPE, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA, CHARACTER_MAXIMUM_LENGTH
         FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
         ORDER BY ORDINAL_POSITION`,
        [process.env.DB_NAME || 'shadowdb', table],
        { operation: `Schema: ${table}` }
      );

      const { rows: countResult } = await query(`SELECT COUNT(*) as count FROM ${table}`);

      schema.push({
        table_name: table,
        columns,
        rowCount: countResult[0].count
      });
    }

    res.json({ data: schema });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST execute custom SQL query (read-only for safety)
router.post('/execute-query', async (req, res) => {
  try {
    const { sql } = req.body;
    
    // Only allow SELECT statements for safety
    const trimmed = sql.trim().toUpperCase();
    if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('SHOW') && !trimmed.startsWith('DESCRIBE')) {
      return res.status(403).json({ error: 'Only SELECT, SHOW, and DESCRIBE queries are allowed in the explorer' });
    }

    const { rows, event } = await query(sql, [], { operation: 'Custom Query Execution' });
    res.json({ data: rows, queryInfo: event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST demonstrate transaction (COMMIT/ROLLBACK)
router.post('/transaction-demo', async (req, res) => {
  try {
    const { action, shouldFail } = req.body;
    const doRollback = shouldFail === true || action === 'rollback';
    
    if (!doRollback) {
      const result = await transaction(async (conn) => {
        // Insert a temporary record
        const [insertResult] = await conn.execute(
          `INSERT INTO criminals (first_name, last_name, alias, status, danger_level) VALUES (?, ?, ?, ?, ?)`,
          ['TRANSACTION', 'TEST', 'TX-Demo', 'released', 'low']
        );
        const insertId = insertResult.insertId;
        
        // Update it
        await conn.execute(
          `UPDATE criminals SET description = ? WHERE id = ?`,
          ['This record was created and updated within a COMMITTED transaction', insertId]
        );
        
        return { insertId, message: 'Transaction committed successfully' };
      }, { operation: 'Transaction Demo: COMMIT' });
      
      // Clean up the test record
      await query('DELETE FROM criminals WHERE alias = ?', ['TX-Demo']);
      
      res.json({ success: true, type: 'COMMIT', ...result });
    } else {
      // Demonstrate ROLLBACK
      try {
        await transaction(async (conn) => {
          await conn.execute(
            `INSERT INTO criminals (first_name, last_name, alias, status, danger_level) VALUES (?, ?, ?, ?, ?)`,
            ['ROLLBACK', 'TEST', 'RB-Demo', 'released', 'low']
          );
          
          // Intentionally cause an error to trigger rollback
          throw new Error('Intentional error to demonstrate ROLLBACK');
        }, { operation: 'Transaction Demo: ROLLBACK' });
      } catch (e) {
        // Expected error
      }
      
      // Verify the record was NOT inserted
      const { rows: check } = await query(
        "SELECT COUNT(*) as count FROM criminals WHERE alias = 'RB-Demo'"
      );
      
      res.json({ 
        success: true, 
        type: 'ROLLBACK',
        message: 'Transaction rolled back - no data was persisted',
        rowsAfterRollback: check[0].count
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET relationship info (for visualization)
router.get('/relationships', async (req, res) => {
  try {
    const relationships = [
      { from: 'criminals', to: 'case_assignments', type: 'One-to-Many', via: 'criminal_id', description: 'A criminal can have many case assignments' },
      { from: 'cases', to: 'case_assignments', type: 'One-to-Many', via: 'case_id', description: 'A case can have many assignments' },
      { from: 'officers', to: 'case_assignments', type: 'One-to-Many', via: 'officer_id', description: 'An officer can have many assignments' },
      { from: 'criminals', to: 'cases', type: 'Many-to-Many', via: 'case_assignments', description: 'Criminals and cases linked through case_assignments junction table' },
      { from: 'cases', to: 'evidence', type: 'One-to-Many', via: 'case_id', description: 'A case can have many evidence items' },
      { from: 'officers', to: 'evidence', type: 'One-to-Many', via: 'collected_by', description: 'An officer can collect many evidence items' }
    ];

    res.json({ relationships });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

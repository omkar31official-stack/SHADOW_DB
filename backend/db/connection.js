const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

let dbInstance = null;
let io = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await open({
      filename: path.join(__dirname, 'shadowdb.sqlite'),
      driver: sqlite3.Database
    });
    // Enable foreign keys
    await dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  return dbInstance;
}

function setSocketIO(socketIO) {
  io = socketIO;
}

/**
 * Execute a query with automatic WebSocket emission for visualization.
 */
async function query(sql, params = [], meta = {}) {
  const db = await getDb();
  const startTime = Date.now();
  
  // Determine query type
  const queryType = sql.trim().split(/\s+/)[0].toUpperCase();
  
  // Determine affected table
  const tableMatch = sql.match(/(?:FROM|INTO|UPDATE|TABLE)\s+`?(\w+)`?/i);
  const table = tableMatch ? tableMatch[1] : 'unknown';
  
  try {
    let result;
    if (['SELECT', 'PRAGMA'].includes(queryType)) {
      result = await db.all(sql, params);
    } else {
      result = await db.run(sql, params);
    }
    
    const duration = Date.now() - startTime;
    const isSelect = Array.isArray(result);
    
    // Build visualization event
    const event = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      queryType,
      table,
      sql: sql.length > 500 ? sql.substring(0, 500) + '...' : sql,
      params: params.length > 0 ? params : undefined,
      duration,
      rowCount: isSelect ? result.length : (result.changes || 0),
      affectedRows: isSelect ? undefined : result.changes,
      insertId: isSelect ? undefined : result.lastID,
      status: 'success',
      ...meta
    };
    
    // Emit to all connected clients via WebSocket
    if (io) {
      io.emit('db:operation', event);
    }
    
    return isSelect ? { rows: result, fields: [], event } : { rows: { affectedRows: result.changes, insertId: result.lastID }, fields: [], event };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    const event = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      queryType,
      table,
      sql: sql.length > 500 ? sql.substring(0, 500) + '...' : sql,
      duration,
      status: 'error',
      error: error.message,
      ...meta
    };
    
    if (io) {
      io.emit('db:operation', event);
    }
    
    throw error;
  }
}

/**
 * Execute a transaction with visualization support.
 */
async function transaction(callback, meta = {}) {
  const db = await getDb();
  const startTime = Date.now();
  
  try {
    await db.exec('BEGIN TRANSACTION');
    
    if (io) {
      io.emit('db:transaction', {
        id: Date.now().toString(36),
        type: 'BEGIN',
        timestamp: new Date().toISOString(),
        ...meta
      });
    }
    
    // Pass the main query function to the callback so operations inside use the same emitting logic
    const connMock = {
      execute: async (sql, params) => {
        const res = await query(sql, params, { inTransaction: true });
        return [res.rows, res.fields];
      }
    };
    
    const result = await callback(connMock);
    
    await db.exec('COMMIT');
    
    if (io) {
      io.emit('db:transaction', {
        id: Date.now().toString(36),
        type: 'COMMIT',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        status: 'success',
        ...meta
      });
    }
    
    return result;
  } catch (error) {
    await db.exec('ROLLBACK');
    
    if (io) {
      io.emit('db:transaction', {
        id: Date.now().toString(36),
        type: 'ROLLBACK',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        status: 'error',
        error: error.message,
        ...meta
      });
    }
    
    throw error;
  }
}

async function testConnection() {
  try {
    await getDb();
    console.log('✅ SQLite connected successfully');
    return true;
  } catch (error) {
    console.error('❌ SQLite connection failed:', error.message);
    return false;
  }
}

module.exports = { getDb, query, transaction, testConnection, setSocketIO };

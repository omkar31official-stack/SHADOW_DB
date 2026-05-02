const fs = require('fs');
const path = require('path');
const { getDb } = require('./connection');

async function runSchema() {
  try {
    const db = await getDb();
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await db.exec(schema);
    console.log('✅ Schema created successfully');
  } catch (error) {
    console.error('❌ Schema creation failed:', error.message);
  }
}

runSchema();

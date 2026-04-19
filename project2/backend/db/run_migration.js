/**
 * Run this once to add profile columns to the users table:
 *   node db/run_migration.js
 */

const db = require('./connection');

const columns = [
  { name: 'vtu_number',    def: "VARCHAR(20) DEFAULT NULL" },
  { name: 'college',       def: "VARCHAR(200) DEFAULT 'Visvesvaraya Technological University'" },
  { name: 'year_of_study', def: "TINYINT DEFAULT NULL" },
  { name: 'phone',         def: "VARCHAR(15) DEFAULT NULL" },
  { name: 'bio',           def: "TEXT DEFAULT NULL" },
  { name: 'linkedin_url',  def: "VARCHAR(500) DEFAULT NULL" },
  { name: 'github_url',    def: "VARCHAR(500) DEFAULT NULL" },
  { name: 'profile_pic',   def: "VARCHAR(500) DEFAULT NULL" },
];

async function addColumnIfMissing(colName, colDef) {
  const [rows] = await db.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
    [colName]
  );
  if (rows.length === 0) {
    await db.query(`ALTER TABLE users ADD COLUMN ${colName} ${colDef}`);
    console.log(`  ✅ Added column: ${colName}`);
  } else {
    console.log(`  ℹ️  Already exists: ${colName}`);
  }
}

async function migrate() {
  console.log('🔄 Running profile migration...');
  try {
    for (const col of columns) {
      await addColumnIfMissing(col.name, col.def);
    }
    console.log('\n🎉 Migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    process.exit(0);
  }
}

migrate();

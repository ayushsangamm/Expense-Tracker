// backend/config/mockDB.js
// A lightweight JSON file database adapter to act as an offline backup database if MongoDB is blocked or unavailable.

const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../data/mock_db.json');

// Ensure database directory and file exist
const initDB = () => {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    // Write an empty schema structure
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ users: [], transactions: [], budgets: [] }, null, 2)
    );
    console.log('✓ Offline Mock Database initialized at:', dbPath);
  }
};

const readDB = () => {
  initDB();
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  readDB,
  writeDB,
};

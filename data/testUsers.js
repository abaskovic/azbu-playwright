const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'testUsers.json');

if (!fs.existsSync(file)) {
  throw new Error('Missing data/testUsers.json - copy data/testUsers.example.json and fill in the users');
}

const TEST_USERS = JSON.parse(fs.readFileSync(file, 'utf8')).map((user) => ({
  expected: 'success',
  ...user,
}));

module.exports = { TEST_USERS };

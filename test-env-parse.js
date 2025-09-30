// Test how Node.js parses .env files
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

console.log('Raw file content (ADMIN_PASSWORD_HASH line):');
const lines = envContent.split('\n');
const hashLine = lines.find(l => l.startsWith('ADMIN_PASSWORD_HASH'));
console.log(hashLine);
console.log('\nLength:', hashLine ? hashLine.length : 0);

// Now check what Node actually sees
console.log('\nWhat process.env sees:');
require('dotenv').config({ path: envPath });
console.log('Hash from process.env:', process.env.ADMIN_PASSWORD_HASH);
console.log('Length:', process.env.ADMIN_PASSWORD_HASH ? process.env.ADMIN_PASSWORD_HASH.length : 0);

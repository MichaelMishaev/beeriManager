const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = process.argv[2] || '6262';
  console.log(`Generating hash for password: ${password}`);

  const hash = await bcrypt.hash(password, 10);
  console.log('\n✅ Password hash generated successfully!');
  console.log('\nAdd this line to your .env.local file:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
  console.log('\nNote: Copy the hash exactly as shown (including all $ signs)');
}

generateHash().catch(console.error);

const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

async function testVerification() {
  console.log('\n🔍 Testing bcrypt verification...\n');

  const password = 'admin1';
  const hashFromEnv = process.env.ADMIN_PASSWORD_HASH;

  console.log('Password to test:', password);
  console.log('Hash from env:', hashFromEnv);
  console.log('Hash length:', hashFromEnv?.length);
  console.log('Hash starts with:', hashFromEnv?.substring(0, 10));

  // Test 1: Verify with hash from env
  console.log('\n--- Test 1: Verify with env hash ---');
  try {
    const result = await bcrypt.compare(password, hashFromEnv);
    console.log('Result:', result ? '✅ MATCH' : '❌ NO MATCH');
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Test 2: Generate fresh hash and verify
  console.log('\n--- Test 2: Fresh hash verification ---');
  const freshHash = await bcrypt.hash(password, 10);
  console.log('Fresh hash:', freshHash);
  const freshResult = await bcrypt.compare(password, freshHash);
  console.log('Result:', freshResult ? '✅ MATCH' : '❌ NO MATCH');

  // Test 3: Verify with the exact hash we generated earlier
  console.log('\n--- Test 3: Known good hash ---');
  const knownHash = '$2a$10$4oiM8SpIsc.38GqBUdCuVuLbQ9ksDIFc.gU5ETDtyhd6xMsZWtiIW';
  const knownResult = await bcrypt.compare(password, knownHash);
  console.log('Known hash:', knownHash);
  console.log('Result:', knownResult ? '✅ MATCH' : '❌ NO MATCH');

  // Test 4: Check if env hash equals known hash
  console.log('\n--- Test 4: Compare hashes ---');
  console.log('Env hash === Known hash:', hashFromEnv === knownHash);
  console.log('Env hash trimmed === Known hash:', hashFromEnv?.trim() === knownHash);

  // Test 5: Character by character comparison
  if (hashFromEnv !== knownHash) {
    console.log('\n--- Test 5: Character differences ---');
    for (let i = 0; i < Math.max(hashFromEnv?.length || 0, knownHash.length); i++) {
      if (hashFromEnv?.[i] !== knownHash[i]) {
        console.log(`Position ${i}: env="${hashFromEnv?.[i]}" (${hashFromEnv?.charCodeAt(i)}) vs known="${knownHash[i]}" (${knownHash.charCodeAt(i)})`);
      }
    }
  }

  console.log('\n✅ Tests completed!\n');
}

testVerification().catch(console.error);

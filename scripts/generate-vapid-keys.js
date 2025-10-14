/**
 * Generate VAPID keys for Web Push Notifications
 * Run: node scripts/generate-vapid-keys.js
 */

const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n============================\n');
console.log('Public Key (for client):', vapidKeys.publicKey);
console.log('Private Key (for server - keep secret!):', vapidKeys.privateKey);
console.log('\n');

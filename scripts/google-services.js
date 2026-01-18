const fs = require('fs');
const path = require('path');

const secret = process.env.GOOGLE_SERVICES_JSON;
if (secret) {
  const filePath = path.join(__dirname, '../android/google-services.json');
  fs.writeFileSync(filePath, secret);
  console.log('google-services.json created from secret');
} else {
  console.warn('GOOGLE_SERVICES_JSON environment variable not set');
}

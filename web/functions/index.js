const functions = require('firebase-functions');
const { execSync } = require('child_process');

exports.api = functions.https.onRequest((req, res) => {
  // Forward API requests to Next.js API routes
  execSync('node server.js', { cwd: __dirname });
});

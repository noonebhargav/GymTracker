const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 8080;
const USE_HTTPS = process.env.HTTPS === 'true';
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) {
        ips.push({ name, ip: addr.address });
      }
    }
  }
  return ips;
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
};

if (!fs.existsSync(DIST_DIR)) {
  console.error(`\x1b[31mError: dist/ directory not found at ${DIST_DIR}\x1b[0m`);
  console.error('Run \x1b[33mnpx expo export --platform web\x1b[0m first.');
  process.exit(1);
}

function createHandler() {
  return (req, res) => {
    // Cross-origin isolation headers required by expo-sqlite OPFS
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');

    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/index.html';

    const filePath = path.join(DIST_DIR, urlPath);

    if (!filePath.startsWith(DIST_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(DIST_DIR, 'index.html'), (fallbackErr, fallbackData) => {
          if (fallbackErr) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(fallbackData);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  };
}

let server;
if (USE_HTTPS) {
  const certPath = path.join(__dirname, '..', '.local-cert.pem');
  const keyPath = path.join(__dirname, '..', '.local-key.pem');

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error(
      '\x1b[31mHTTPS mode requires certs: .local-cert.pem and .local-key.pem\x1b[0m'
    );
    console.error('Generate with:');
    console.error(
      '  \x1b[33mopenssl req -x509 -newkey rsa:2048 -keyout .local-key.pem -out .local-cert.pem -days 365 -nodes -subj "/CN=localhost"\x1b[0m'
    );
    process.exit(1);
  }

  server = https.createServer(
    { cert: fs.readFileSync(certPath), key: fs.readFileSync(keyPath) },
    createHandler()
  );
} else {
  server = http.createServer(createHandler());
}

server.listen(PORT, '0.0.0.0', () => {
  const protocol = USE_HTTPS ? 'https' : 'http';
  const networkIPs = getNetworkIPs();

  console.log(`\n  \x1b[32mGymTracker web dist server running at:\x1b[0m`);
  console.log(`  Local:   \x1b[36m${protocol}://localhost:${PORT}\x1b[0m`);

  for (const { name, ip } of networkIPs) {
    console.log(`  Network: \x1b[36m${protocol}://${ip}:${PORT}\x1b[0m  (${name})`);
  }

  if (!USE_HTTPS && networkIPs.length > 0) {
    console.log(
      `\n  \x1b[33mWarning:\x1b[0m SQLite (OPFS) requires a secure context.\n`
      + `  \x1b[33m         \x1b[0m Network access via HTTP will fail — use:\n`
      + `  \x1b[33m         \x1b[0m \x1b[2mnpm run serve:web:https\x1b[0m for network testing\n`
    );
  }

  console.log(`\n  Headers:`);
  console.log(`    Cross-Origin-Opener-Policy: same-origin`);
  console.log(`    Cross-Origin-Embedder-Policy: credentialless\n`);
});

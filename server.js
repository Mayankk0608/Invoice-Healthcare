// server.js - Lightweight Node.js Server for Doc-In-The-Box Healthcare Platform
// Zero external dependencies needed - uses Node.js standard library (http, fs, path, url)
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables from .env
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                const idx = trimmed.indexOf('=');
                const key = trimmed.substring(0, idx).trim();
                const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        });
    }
}
loadEnv();

const mistralService = require('./Public/mistralService.js');
const ruleEngine = require('./Public/ruleBasedEngine.js');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PUBLIC_DIR = path.join(__dirname, 'Public');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.csv': 'text/csv; charset=utf-8'
};

const server = http.createServer(async (req, res) => {
    // Enable CORS for API routes
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API: Config check
    if (pathname === '/api/config' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            mistralConfigured: mistralService.isApiConfigured(),
            model: mistralService.model,
            ruleBasedEngineAvailable: true
        }));
        return;
    }

    // Helper to read JSON request body
    const getRequestBody = () => new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });

    // API: Symptom Analysis (Mistral AI + Rule-based fallback)
    if (pathname === '/api/symptom-check' && req.method === 'POST') {
        try {
            const body = await getRequestBody();
            const symptoms = body.symptoms || '';
            const result = await mistralService.analyzeSymptoms(symptoms);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // API: General / Medical Query (Mistral AI + Rule-based fallback)
    if (pathname === '/api/query' && req.method === 'POST') {
        try {
            const body = await getRequestBody();
            const query = body.query || body.message || '';
            const answer = await mistralService.answerQuery(query);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ answer }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // Serve static files from Public/
    let reqPath = pathname === '/' ? '/index.html' : pathname;
    let filePath = path.join(PUBLIC_DIR, reqPath);

    // Also allow serving Datasets if requested
    if (reqPath.startsWith('/Datasets/')) {
        filePath = path.join(__dirname, reqPath);
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
        fs.createReadStream(filePath).pipe(res);
    });
});

if (require.main === module) {
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\n⚠️  Port ${PORT} is already in use by another instance.`);
            console.error(`👉 Solution: Stop the previous 'npm start' terminal process, or change PORT in .env (e.g. PORT=3001).\n`);
            process.exit(1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🏥 Doc-In-The-Box Server running at: http://localhost:${PORT}`);
        console.log(`🤖 Mistral AI Status: ${mistralService.isApiConfigured() ? 'API Key Configured (' + mistralService.getModel() + ')' : 'No Key -> Rule-Based Engine Active'}`);
        console.log(`📁 Datasets Active: bacteria_list_200.csv, BRFSS Diabetes, WHO CVD`);
        console.log(`=======================================================`);
    });
}

module.exports = server;

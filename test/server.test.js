// server.test.js - Unit tests for Server API endpoints and static serving
const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const server = require('../server.js');

function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
        }
        req.end();
    });
}

test('Server API Unit Tests', async (t) => {
    // Start server on an ephemeral port
    const testPort = 3987;
    await new Promise((resolve) => server.listen(testPort, resolve));

    try {
        await t.test('GET /api/config returns engine configuration', async () => {
            const res = await makeRequest({
                hostname: 'localhost',
                port: testPort,
                path: '/api/config',
                method: 'GET'
            });
            assert.strictEqual(res.statusCode, 200);
            const data = JSON.parse(res.body);
            assert.ok('mistralConfigured' in data, 'Must have mistralConfigured field');
            assert.strictEqual(data.ruleBasedEngineAvailable, true, 'Rule-based engine must be available');
        });

        await t.test('POST /api/symptom-check returns triage assessment from datasets', async () => {
            const res = await makeRequest({
                hostname: 'localhost',
                port: testPort,
                path: '/api/symptom-check',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { symptoms: 'Severe retrosternal chest pain with left arm radiation' });

            assert.strictEqual(res.statusCode, 200);
            const data = JSON.parse(res.body);
            assert.strictEqual(data.urgency, 'high', 'Cardiac symptoms must be high urgency');
            assert.ok(data.conditions.length > 0, 'Must provide differential diagnosis');
            assert.ok(data.recommendations.length > 0, 'Must provide recommendations');
            assert.ok(data.source.includes('Rule-Based Engine') || data.source.includes('Mistral AI'));
        });

        await t.test('POST /api/query answers bacteria query via Mistral AI or Rule-Based Fallback', async () => {
            const res = await makeRequest({
                hostname: 'localhost',
                port: testPort,
                path: '/api/query',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { query: 'Tell me about Escherichia coli' });

            assert.strictEqual(res.statusCode, 200);
            const data = JSON.parse(res.body);
            assert.ok(data.answer.toLowerCase().includes('coli') || data.answer.toLowerCase().includes('bacteria'), 'Must discuss E. coli');
            assert.ok(data.answer.includes('Mistral AI') || data.answer.includes('Rule-Based Engine') || data.answer.includes('bacteria_list_200.csv'), 'Must cite engine source');
        });

        await t.test('POST /api/query answers diabetes query via Mistral AI or Rule-Based Fallback', async () => {
            const res = await makeRequest({
                hostname: 'localhost',
                port: testPort,
                path: '/api/query',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { query: 'What are diabetes risk factors?' });

            assert.strictEqual(res.statusCode, 200);
            const data = JSON.parse(res.body);
            assert.ok(data.answer.toLowerCase().includes('diabetes') || data.answer.toLowerCase().includes('blood sugar') || data.answer.toLowerCase().includes('glucose'), 'Must discuss diabetes');
            assert.ok(data.answer.includes('Mistral AI') || data.answer.includes('BRFSS') || data.answer.includes('Rule-Based Engine'), 'Must cite engine source');
        });

        await t.test('GET / serves index.html with new scripts loaded', async () => {
            const res = await makeRequest({
                hostname: 'localhost',
                port: testPort,
                path: '/',
                method: 'GET'
            });
            assert.strictEqual(res.statusCode, 200);
            assert.ok(res.body.includes('Doc-In-The-Box'));
            assert.ok(res.body.includes('ruleBasedEngine.js'));
            assert.ok(res.body.includes('mistralService.js'));
        });
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

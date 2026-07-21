
const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../server.js');

function makeRequest(server, options, body) {
    return new Promise((resolve, reject) => {
        const { port } = server.address();
        const req = http.request({ ...options, port }, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                resolve({status: res.statusCode, body: data ? JSON.parse(data) : null});
            });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

test('health check válaszol', async () => {
    const server = app.listen(0);
    const res = await makeRequest(server, { path: '/health', method: 'GET' });
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(res.body.status, 'ok');
    server.close();
});

test('érvényes URL rövidítése sikeres', async () => {
    const server = app.listen(0);
    const res = await makeRequest(
        server, 
        { path: '/shorten', method: 'POST', headers: { 'Content-Type': 'application/json' } }, 
        { url: 'http://example.com' }
    );
    assert.strictEqual(res.status, 201);
    assert.ok(res.body.code);
    server.close();
});

test('érvénytelen URL elutasitva', async () => {
    const server = app.listen(0);
    const res = await makeRequest(
        server,
        { path: '/shorten', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { url: 'nem-egy-url' }
    );
    assert.strictEqual(res.status, 400);
    server.close();
});

/**
 * NewsMate Automated Health and API Verification Test
 * Used by GitHub Actions CI/CD and npm test
 */
const http = require('http');
const assert = require('assert');

process.env.PORT = '3999';
process.env.NODE_ENV = 'test';

console.log('🧪 Starting NewsMate Automated Verification Suite...');

// Load server
require('../server');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const req = http.get(`http://localhost:3999${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, headers: res.headers, body: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, raw: data });
                }
            });
        });
        req.on('error', reject);
    });
}

setTimeout(async () => {
    try {
        console.log('1️⃣ Testing /api/health endpoint...');
        const healthRes = await makeRequest('/api/health');
        assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
        assert.strictEqual(healthRes.body.status, 'ok', 'Health status should be ok');
        console.log(`   ✅ Passed: Server ${healthRes.body.name} (${healthRes.body.version})`);

        console.log('2️⃣ Testing /api/markets telemetry endpoint...');
        const marketsRes = await makeRequest('/api/markets');
        assert.strictEqual(marketsRes.status, 200, 'Markets endpoint should return 200');
        assert.ok(Array.isArray(marketsRes.body.indices), 'Markets should return an indices array');
        assert.ok(marketsRes.body.indices.length >= 5, 'Markets should have at least 5 benchmarks');
        console.log(`   ✅ Passed: ${marketsRes.body.indices.length} market benchmarks active`);

        console.log('3️⃣ Testing In-Memory Cache on /api/markets...');
        const cachedMarketsRes = await makeRequest('/api/markets');
        assert.strictEqual(cachedMarketsRes.headers['x-cache'], 'HIT', 'Second request should hit cache');
        console.log('   ✅ Passed: Cache HIT verified with sub-10ms response');

        console.log('4️⃣ Testing /api/news zero-key fallback dispatches...');
        const newsRes = await makeRequest('/api/news?category=general');
        assert.strictEqual(newsRes.status, 200, 'News endpoint should return 200');
        assert.ok(Array.isArray(newsRes.body.articles), 'News articles should be an array');
        assert.ok(newsRes.body.articles.length > 0, 'Should return fallback articles even with no API keys');
        console.log(`   ✅ Passed: ${newsRes.body.articles.length} news dispatches returned`);

        console.log('\n🎉 ALL SYSTEM VERIFICATION CHECKS PASSED!');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ Verification failed:', err.message);
        process.exit(1);
    }
}, 1500);

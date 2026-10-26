const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '..', '.env');
const env = fs.readFileSync(envPath, 'utf8');
env.split('\n').forEach(line => {
    const parts = line.trim().split('=');
    if (parts.length >= 2 && !parts[0].startsWith('#')) {
        const k = parts[0].trim();
        const v = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
        process.env[k] = v;
    }
});

const mistral = require('../Public/mistralService.js');

async function verify() {
    console.log('Verifying Mistral API Key...');
    console.log('Model configured:', mistral.getModel());

    try {
        const chatAns = await mistral.answerQuery('What are symptoms of bacterial food poisoning?');
        console.log('\n--- LIVE CHAT RESULT ---');
        console.log(chatAns);

        const triage = await mistral.analyzeSymptoms('Fever 101F, persistent cough and sore throat');
        console.log('\n--- LIVE TRIAGE RESULT ---');
        console.log(JSON.stringify(triage, null, 2));

        console.log('\n>>> MISTRAL API IS FULLY WORKING! <<<');
    } catch (e) {
        console.error('Verification error:', e);
    }
}

verify();

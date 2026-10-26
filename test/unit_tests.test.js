// unit_tests.test.js - Unit tests for RuleBasedEngine and MistralService
const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const ruleEngine = require('../Public/ruleBasedEngine.js');
const mistralService = require('../Public/mistralService.js');

test('Step 1: RuleBasedEngine - Bacteria Dataset Queries', (t) => {
    // 1. Harmful bacteria lookup (E. coli)
    const ecoli = ruleEngine.findBacteriaByKeyword('Escherichia coli');
    assert.ok(ecoli.length > 0, 'Should find Escherichia coli');
    assert.strictEqual(ecoli[0].harmful, true, 'E. coli should be marked harmful');
    assert.strictEqual(ecoli[0].whereFound, 'Intestinal tract');

    // 2. Harmless/probiotic bacteria lookup (Bacillus subtilis / Lactobacillus acidophilus)
    const lacto = ruleEngine.findBacteriaByKeyword('Lactobacillus acidophilus');
    assert.ok(lacto.length > 0, 'Should find Lactobacillus acidophilus');
    assert.strictEqual(lacto[0].harmful, false, 'Lactobacillus acidophilus should not be harmful');

    // 3. answerQuery for bacteria query
    const answer = ruleEngine.answerQuery('What is Vibrio cholerae?');
    assert.ok(answer.includes('Vibrio cholerae'), 'Answer should mention Vibrio cholerae');
    assert.ok(answer.includes('Harmful to humans'), 'Answer should state harmfulness');
    assert.ok(answer.includes('bacteria_list_200.csv'), 'Answer should cite the dataset file');
});

test('Step 2: RuleBasedEngine - Diabetes Risk Indicators from BRFSS Dataset', (t) => {
    // Query with diabetes symptoms
    const triage = ruleEngine.analyzeSymptoms('I have extreme thirst, frequent urination, and feeling tired');
    assert.ok(triage.conditions.some(c => c.name.toLowerCase().includes('diabetes')), 'Should identify diabetes condition');
    assert.strictEqual(triage.urgency, 'moderate', 'Urgency should be moderate');
    assert.ok(triage.source.includes('Diabaties_patient'), 'Should cite diabetes dataset');

    // Chat query about diabetes
    const chatAns = ruleEngine.answerQuery('What are diabetes risk factors?');
    assert.ok(chatAns.includes('75.3%'), 'Should cite 75.3% High BP from BRFSS dataset');
    assert.ok(chatAns.includes('BMI'), 'Should cite BMI');
});

test('Step 3: RuleBasedEngine - Cardiovascular Emergency Triage from WHO CVD Dataset', (t) => {
    // High urgency chest pain with left arm radiation
    const cardiacTriage = ruleEngine.analyzeSymptoms('Severe chest pain radiating to left arm and cold sweat');
    assert.strictEqual(cardiacTriage.urgency, 'high', 'Cardiovascular symptoms must be high urgency');
    assert.ok(cardiacTriage.conditions.some(c => c.name.includes('Acute Coronary Syndrome')), 'Should identify Acute Coronary Syndrome');
    assert.ok(cardiacTriage.recommendations.some(r => r.includes('EMERGENCY') || r.includes('108') || r.includes('112')), 'Should recommend emergency call');
    assert.ok(cardiacTriage.source.includes('Heart_attacks'), 'Should cite Heart attacks dataset');
});

test('Step 4: RuleBasedEngine - Respiratory Infection Triage', (t) => {
    const respTriage = ruleEngine.analyzeSymptoms('I have a cough with fever and phlegm');
    assert.ok(['moderate', 'high'].includes(respTriage.urgency), 'Respiratory urgency should be moderate/high');
    assert.ok(respTriage.conditions.some(c => c.name.includes('Respiratory') || c.name.includes('Pneumonia')), 'Should match respiratory condition');
});

test('Step 5: MistralService - Fallback when API is unconfigured', async (t) => {
    // Explicitly clear API key to ensure unconfigured state
    mistralService.setApiKey(null);
    delete process.env.MISTRAL_API_KEY;
    assert.strictEqual(mistralService.isApiConfigured(), false, 'API should not be configured');

    // 1. Symptom analysis fallback
    const result = await mistralService.analyzeSymptoms('Chest pain and shortness of breath');
    assert.strictEqual(result.urgency, 'high', 'Fallback should return high urgency for chest pain');
    assert.ok(result.source.includes('Rule-Based Engine'), 'Source must indicate Rule-Based Engine fallback');
    assert.ok(result.conditions.length > 0, 'Conditions must not be empty');

    // 2. Chat query fallback
    const chatResult = await mistralService.answerQuery('Tell me about Salmonella');
    assert.ok(chatResult.includes('Salmonella'), 'Fallback should answer about Salmonella');
    assert.ok(chatResult.includes('bacteria_list_200.csv'), 'Fallback should cite dataset');
});

test('Step 6: MistralService - Fallback when API call encounters network/HTTP error', async (t) => {
    // Provide a dummy key that fails
    mistralService.setApiKey('test_dummy_key_12345');
    assert.strictEqual(mistralService.isApiConfigured(), true, 'API is configured with test key');

    // Mock global fetch to simulate a 401 Unauthorized or network failure
    const originalFetch = global.fetch;
    global.fetch = async () => {
        return {
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            text: async () => '{"message": "Unauthorized: Invalid API Key"}'
        };
    };

    try {
        const result = await mistralService.analyzeSymptoms('Frequent urination and high blood sugar');
        // Must NOT crash! Must gracefully fall back to RuleBasedEngine
        assert.ok(result.source.includes('Rule-Based Engine'), 'Must fall back to Rule-Based Engine on API error');
        assert.ok(result.conditions.some(c => c.name.includes('Diabetes')), 'Must identify Diabetes condition from dataset');
        assert.strictEqual(result.urgency, 'moderate');

        // Chat query test under API failure
        const chatAns = await mistralService.answerQuery('What are the symptoms of a heart attack?');
        assert.ok(chatAns.includes('Cardiovascular Emergency') || chatAns.includes('Heart'), 'Must answer using dataset fallback');
        assert.ok(chatAns.includes('Rule-Based Engine fallback'), 'Must note fallback in answer');
    } finally {
        global.fetch = originalFetch;
        mistralService.setApiKey(null);
    }
});

test('Step 7: MistralService - Successful API parsing and handling', async (t) => {
    mistralService.setApiKey('valid_mock_mistral_key');

    const originalFetch = global.fetch;
    // Mock successful Mistral response
    global.fetch = async () => {
        return {
            ok: true,
            status: 200,
            json: async () => ({
                choices: [
                    {
                        message: {
                            content: JSON.stringify({
                                urgency: "high",
                                conditions: [
                                    { name: "Acute Bronchitis", probability: "60%", description: "Airway inflammation" },
                                    { name: "Pneumonia", probability: "40%", description: "Lung tissue infection" }
                                ],
                                recommendations: [
                                    "Consult a physician immediately",
                                    "Stay hydrated",
                                    "Monitor temperature"
                                ],
                                disclaimer: "Medical disclaimer: Consult doctor."
                            })
                        }
                    }
                ]
            })
        };
    };

    try {
        const result = await mistralService.analyzeSymptoms('Severe fever and chest tightness');
        assert.strictEqual(result.urgency, 'high');
        assert.strictEqual(result.conditions.length, 2);
        assert.strictEqual(result.conditions[0].name, 'Acute Bronchitis');
        assert.ok(result.source.includes('Mistral AI'), 'Source must indicate Mistral AI');
    } finally {
        global.fetch = originalFetch;
        mistralService.setApiKey(null);
    }
});

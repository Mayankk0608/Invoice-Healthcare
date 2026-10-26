// mistralService.js - Mistral AI API Integration with Rule-Based Fallback
// API keys are read strictly from .env (no frontend configuration options).
// When run in browser, requests go to /api/symptom-check and /api/query.
// If Mistral API is unconfigured, rate-limited, or unavailable, it automatically falls back
// to the Rule-Based Engine using the project's dataset files.

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        const ruleBasedEngine = require('./ruleBasedEngine.js');
        module.exports = factory(ruleBasedEngine);
    } else {
        root.MistralService = factory(root.RuleBasedEngine);
    }
}(typeof self !== 'undefined' ? self : this, function (ruleBasedEngine) {

    class MistralService {
        constructor(options = {}) {
            this.endpoint = options.endpoint || 'https://api.mistral.ai/v1/chat/completions';
            this.model = options.model || (typeof process !== 'undefined' && process.env && process.env.MISTRAL_MODEL) || 'mistral-small-latest';
            this.ruleEngine = options.ruleEngine || ruleBasedEngine;
            this.timeoutMs = options.timeoutMs || 8000;
            this._apiKey = options.apiKey || null;
        }

        getApiKey() {
            if (this._apiKey) return this._apiKey;
            if (typeof process !== 'undefined' && process.env && process.env.MISTRAL_API_KEY) {
                return process.env.MISTRAL_API_KEY.trim();
            }
            return null;
        }

        setApiKey(key) {
            this._apiKey = key ? key.trim() : null;
        }

        isApiConfigured() {
            const key = this.getApiKey();
            return !!(key && key.length > 5 && key !== 'your_mistral_api_key_here');
        }

        getModel() {
            if (typeof process !== 'undefined' && process.env && process.env.MISTRAL_MODEL) {
                return process.env.MISTRAL_MODEL.trim();
            }
            return this.model || 'open-mistral-7b';
        }

        /**
         * Server-side call to Mistral AI API with auto model-fallback
         */
        async callMistralApi(messages, options = {}) {
            const apiKey = this.getApiKey();
            if (!this.isApiConfigured()) {
                throw new Error('Mistral API Key is not configured in .env');
            }

            const primaryModel = options.model || this.getModel();
            const candidateModels = [primaryModel, 'open-mistral-7b', 'mistral-tiny'].filter((v, i, a) => a.indexOf(v) === i);

            let lastError = null;

            for (const modelName of candidateModels) {
                const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
                const timeoutId = controller ? setTimeout(() => controller.abort(), this.timeoutMs) : null;

                try {
                    const response = await fetch(this.endpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${apiKey}`
                        },
                        body: JSON.stringify({
                            model: modelName,
                            messages: messages,
                            temperature: options.temperature !== undefined ? options.temperature : 0.2,
                            max_tokens: options.max_tokens || 800
                        }),
                        signal: controller ? controller.signal : undefined
                    });

                    if (timeoutId) clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();
                        if (data.choices && data.choices.length && data.choices[0].message) {
                            this.activeModel = modelName;
                            return data.choices[0].message.content;
                        }
                    }

                    const errorText = await response.text();
                    lastError = new Error(`Mistral API [${modelName}] HTTP ${response.status}: ${errorText || response.statusText}`);
                    // If rate limited on this model, try next candidate model
                    if (response.status === 429) {
                        console.warn(`Model ${modelName} rate limited, trying next available model...`);
                        continue;
                    }
                    throw lastError;
                } catch (err) {
                    if (timeoutId) clearTimeout(timeoutId);
                    lastError = err;
                    if (err.message && err.message.includes('429')) continue;
                    throw err;
                }
            }

            throw lastError || new Error('All Mistral models exhausted');
        }

        /**
         * Analyze symptoms:
         * 1. In browser: calls backend /api/symptom-check (which uses .env)
         * 2. In Node: calls Mistral API with process.env.MISTRAL_API_KEY
         * 3. On any failure/unavailability: automatically falls back to RuleBasedEngine
         */
        async analyzeSymptoms(symptoms) {
            if (!symptoms || !symptoms.trim()) {
                return {
                    urgency: 'low',
                    conditions: [],
                    recommendations: ['Please describe your symptoms.'],
                    source: 'None',
                    disclaimer: ''
                };
            }

            // Client-side execution in browser
            if (typeof window !== 'undefined' && typeof fetch === 'function') {
                try {
                    const response = await fetch('/api/symptom-check', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ symptoms })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.conditions) return data;
                    }
                } catch (e) {
                    console.warn('Backend /api/symptom-check unreachable, using client rule-based fallback:', e);
                }
                // Fallback to client-side rule engine
                return this.ruleEngine.analyzeSymptoms(symptoms);
            }

            // Server-side / Node.js execution
            const sysPrompt =
`You are an expert clinical triage assistant for Doc-In-The-Box.
Analyze the user's symptoms and return STRICT JSON with this exact schema:
{
  "urgency": "high" | "moderate" | "low",
  "conditions": [
    { "name": "Condition Name", "probability": "e.g. 70%", "description": "1-2 sentence description" }
  ],
  "recommendations": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3"
  ],
  "disclaimer": "This is an AI triage recommendation, not a definitive diagnosis. Consult a doctor."
}
Only output the JSON object. Do not wrap in markdown or backticks.`;

            try {
                if (!this.isApiConfigured()) {
                    console.info('Mistral API key not configured in .env; using Rule-Based Engine.');
                    const fallback = this.ruleEngine.analyzeSymptoms(symptoms);
                    fallback.source = 'Rule-Based Engine (Fallback: .env MISTRAL_API_KEY not set)';
                    return fallback;
                }

                const rawContent = await this.callMistralApi([
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: `Patient Symptoms: ${symptoms}` }
                ]);

                let cleaned = rawContent.trim();
                if (cleaned.startsWith('```')) {
                    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
                }

                const parsed = JSON.parse(cleaned);
                const urgency = (parsed.urgency || 'moderate').toLowerCase();
                const conditions = Array.isArray(parsed.conditions) ? parsed.conditions : [];
                const recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : [];

                return {
                    urgency: ['high', 'moderate', 'low'].includes(urgency) ? urgency : 'moderate',
                    conditions: conditions.length > 0 ? conditions : [
                        { name: 'Clinical Consultation Needed', probability: '100%', description: 'Consult a physician for physical exam.' }
                    ],
                    recommendations: recommendations.length > 0 ? recommendations : [
                        'Rest and stay hydrated',
                        'Consult a qualified healthcare professional'
                    ],
                    source: `Mistral AI (${this.model})`,
                    disclaimer: parsed.disclaimer || 'This is an AI triage recommendation, not a definitive medical diagnosis.'
                };
            } catch (err) {
                console.warn('Mistral AI API unavailable or failed:', err.message, '-> falling back to RuleBasedEngine');
                const fallback = this.ruleEngine.analyzeSymptoms(symptoms);
                fallback.source = `Rule-Based Engine (Fallback: ${err.message || 'API unavailable'})`;
                return fallback;
            }
        }

        /**
         * Answer user chat / support query:
         * 1. In browser: calls backend /api/query (which uses .env)
         * 2. In Node: calls Mistral API with process.env.MISTRAL_API_KEY
         * 3. On any failure/unavailability: automatically falls back to RuleBasedEngine
         */
        async answerQuery(userQuery) {
            if (!userQuery || !userQuery.trim()) {
                return 'Please enter a message or question so I can assist you.';
            }

            // Client-side execution in browser
            if (typeof window !== 'undefined' && typeof fetch === 'function') {
                try {
                    const response = await fetch('/api/query', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ query: userQuery })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.answer) return data.answer;
                    }
                } catch (e) {
                    console.warn('Backend /api/query unreachable, using client rule-based fallback:', e);
                }
                return this.ruleEngine.answerQuery(userQuery);
            }

            // Server-side / Node.js execution
            const sysPrompt =
`You are the official Doc-In-The-Box healthcare and triage AI assistant.
Answer the user's question clearly, politely, and informatively.
If asked about bacteria, infectious diseases, diabetes, heart disease, or platform features (booking appointments, health wallet), provide accurate medical and platform guidance.
Include a disclaimer when providing medical information. Keep answers concise, helpful, and properly formatted in markdown.`;

            try {
                if (!this.isApiConfigured()) {
                    console.info('Mistral API key not configured in .env; using Rule-Based Engine for query answer.');
                    return this.ruleEngine.answerQuery(userQuery);
                }

                const responseText = await this.callMistralApi([
                    { role: 'system', content: sysPrompt },
                    { role: 'user', content: userQuery }
                ], { temperature: 0.3 });

                return `${responseText}\n\n*(Powered by Mistral AI - ${this.model})*`;
            } catch (err) {
                console.warn('Mistral AI API query failed:', err.message, '-> falling back to RuleBasedEngine');
                const ruleAnswer = this.ruleEngine.answerQuery(userQuery);
                return `${ruleAnswer}\n\n*(Note: Generated via Rule-Based Engine fallback due to Mistral API unavailability)*`;
            }
        }
    }

    return new MistralService();
}));

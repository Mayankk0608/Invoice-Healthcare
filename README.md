
# Doc-In-The-Box — Healthcare Assistant

Doc-In-The-Box is a browser-based healthcare project prototype with patient, doctor, and administrator dashboards. It includes a symptom checker and medical Q&A assistant that can use Mistral AI on the server when configured, with a local rule-based engine as an offline/error fallback.

> **Medical safety:** This project is for demonstration and educational use only. Its symptom analysis and generated answers are not medical advice, a diagnosis, or a substitute for a qualified healthcare professional. For a medical emergency, contact your local emergency services.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run locally](#run-locally)
- [Mistral AI configuration](#mistral-ai-configuration)
- [Application endpoints](#application-endpoints)
- [Project layout](#project-layout)
- [Datasets](#datasets)
- [Tests](#tests)
- [Limitations and security](#limitations-and-security)

## Features

- Patient, doctor, and administrator dashboard views.
- Symptom checker with urgency levels, possible conditions, recommendations, and a medical disclaimer.
- Medical question answering for supported bacteria, diabetes, cardiovascular, appointment, voice, and health-wallet topics.
- Optional server-side Mistral AI integration; the rule-based engine is used when no key is configured or the API is unavailable.
- Voice input/output and language selection in the user interface (browser support may vary).
- Demo-oriented appointment, health wallet, invoice/OCR, and dashboard interactions.
- A lightweight Node.js HTTP server for the static app and assistant API.

## Technology

- HTML, CSS, and browser JavaScript in `Public/`.
- Node.js built-in modules for the server; there are no npm runtime dependencies.
- Node's built-in test runner for automated tests.
- Optional Mistral AI Chat Completions API integration.
- Firebase Realtime Database and Identity Toolkit calls are present in the front-end prototype for some flows.

## Requirements

- Node.js 18 or newer (the optional Mistral integration uses Node's built-in `fetch`).
- npm, included with Node.js.
- A Mistral API key only if you want AI-generated responses. The local rule-based fallback works without one.

## Run locally

1. Clone the repository and change into its directory:

   ```bash
   git clone https://github.com/Mayankk0608/Invoice-Healthcare.git
   cd Invoice-Healthcare
   ```

2. Start the app:

   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000).

The default port is `3000`. Set `PORT` in your environment or `.env` file to use another port. No `npm install` is required for the current project because it does not declare external dependencies.

## Mistral AI configuration

Create a local `.env` file in the project root. Keep this file private and do not commit API keys:

```dotenv
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_MODEL=mistral-small-latest
PORT=3000
```

`MISTRAL_API_KEY` is optional. If it is absent, the backend reports that Mistral is not configured and answers using the rule-based engine. If an API request fails, the assistant also attempts the rule-based fallback. `MISTRAL_MODEL` and `PORT` are optional.

## Application endpoints

The server exposes the following local routes:

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Serves the application entry page. |
| `GET` | `/api/config` | Reports whether Mistral is configured, the selected model, and rule-engine availability. |
| `POST` | `/api/symptom-check` | Accepts `{"symptoms":"..."}` and returns the symptom assessment. |
| `POST` | `/api/query` | Accepts `{"query":"..."}` (or `{"message":"..."}`) and returns an assistant answer. |
| `GET` | `/Datasets/...` | Serves project dataset files. |

Example request:

```bash
curl -X POST http://localhost:3000/api/symptom-check \
  -H "Content-Type: application/json" \
  -d "{\"symptoms\":\"fever and cough\"}"
```

The symptom-check response includes an `urgency`, `conditions`, `recommendations`, `source`, and `disclaimer`. The query endpoint returns an `answer` string.

## Project layout

```text
Invoice-Healthcare/
├── Documentation/              Project requirements document
├── Datasets/                   CSV health and disease datasets
├── Public/                     Browser app, styles, and assistant logic
│   ├── index.html              Application interface
│   ├── main.js                 Main app and dashboard interactions
│   ├── patient.js              Patient features
│   ├── doctor.js               Doctor dashboard
│   ├── admin.js                Admin dashboard
│   ├── navigation.js           Page navigation
│   ├── voice.js                Voice input/output
│   ├── mistralService.js       Mistral integration and fallback handling
│   ├── ruleBasedEngine.js      Dataset-informed local assistant
│   └── dataset_knowledge.json  Additional dataset knowledge for the engine
├── sql/
│   └── schema.sql              Draft relational schema reference
├── test/                       Node.js tests
├── package.json                Start and test scripts
└── server.js                   Static file server and assistant API
```

Other files in `Public/` provide styling, animations, and the service worker.

## Datasets

The project includes CSV data in these categories:

- `Datasets/Common_Health_Disease/`: bacteria reference data.
- `Datasets/Diabaties_patient/`: BRFSS diabetes health-indicator datasets.
- `Datasets/Heart_attacks/`: mortality, cardiovascular, respiratory, and other cause-of-death datasets.

The rule-based assistant contains a built-in core knowledge base and can load additional knowledge from `Public/dataset_knowledge.json`. Dataset-derived information is intended for project demonstrations; it should not be treated as clinically validated guidance.

## Tests

Run the automated unit and server endpoint tests with:

```bash
npm test
```

The tests cover rule-based dataset queries, symptom triage, Mistral fallback behavior, API responses, and static page serving. Some tests mock external API responses so they do not require a working Mistral API key.

An optional live integration check is available:

```bash
node test/verify_key.js
```

This script reads `.env` and sends sample medical prompts to the configured Mistral API. It requires a valid key, uses API quota, and is not part of `npm test`.

## Limitations and security

- This is a prototype, not a production healthcare system. Do not use it to make medical decisions or store real patient data.
- The dashboard includes mock/demo content and some flows use external Firebase and OCR endpoints configured in browser code. Review and replace prototype credentials/configuration before any deployment; never put private service credentials in client-side code.
- The SQL file is a schema reference. The included Node.js server does not create or connect to a SQL database.
- The Mistral key is read by the Node.js server from `.env`; do not expose it in browser code, public logs, screenshots, or commits.
- Before public deployment, implement appropriate authentication and authorization, input limits, secure CORS and transport settings, privacy controls, data retention rules, monitoring, and clinical validation.

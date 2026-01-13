# Cypress AI Reporter

This repository contains a Cypress plugin and associated tools to power AI-driven analysis of Cypress test executions. It leverages **Elasticsearch** for storage and vector search, and **Ollama** for generating local embeddings of test errors and logs to enable semantic search over test failures.

## Project Structure

- **`cypress_ai_reporter/`**: The core package.
    - Contains the Cypress plugin source code.
    - Includes scripts to manage the Elasticsearch index and query results.
    - Provides a Docker Compose file for the backend infrastructure (Elasticsearch, Kibana).
- **`example/`**: A sample Cypress project pre-configured to use the reporter.
- **`reinstall_local.sh`**: A convenience script to build the reporter and update the dependency in the `example` project.

## Prerequisites

- **Node.js** (v16+ recommended)
- **Docker & Docker Compose**
- **Ollama** (installed locally)
    - You must pull the embedding and chat models used by the plugin and query engine:
      ```bash
      ollama pull nomic-embed-text
      ollama pull gemma3
      ```

## Getting Started

### 1. Start Infrastructure

Navigate to the reporter directory and start the services:

```bash
cd cypress_ai_reporter
docker-compose up -d
```

This will start Elasticsearch on `http://localhost:9200` and Kibana on `http://localhost:5601`.

### 2. Prepare the Reporter

Install dependencies and initialize the backend index:

```bash
cd cypress_ai_reporter
npm install
npm start
```
`npm start` runs `src/start-backend.ts` which sets up the necessary index mapping in Elasticsearch.

### 3. Run the Example Project

To see it in action, you can run the example tests. We recommend using the helper script to ensure the local package is built and linked correctly:

```bash
# From the root of the repository
./reinstall_local.sh
```

Then run the tests in the `example` directory:

```bash
cd example
npx cypress run
```

As tests run, their results (including error logs and generated embeddings) are sent to Elasticsearch.

### 4. Query Results with AI

You can query the test results using natural language. The reporter package includes a CLI tool for this:

```bash
cd cypress_ai_reporter
npm run query "What tests failed due to login issues?"
```

## Configuration

In your Cypress project's `cypress.config.js` (or `.ts`), register the plugin:

```javascript
const { defineConfig } = require("cypress");
const { cypressAiReporter } = require("cypress-ai-reporter");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      cypressAiReporter(on, config, {
        elasticNode: 'http://localhost:9200', // optional
        indexName: 'cypress-test-logs',       // optional
        ollamaUrl: 'http://localhost:11434',  // optional
        embeddingModel: 'nomic-embed-text'    // optional
      });
    },
  },
});
```

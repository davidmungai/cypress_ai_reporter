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
- **Python 3** (with `opencv-python`, `numpy`, and `ffmpeg` installed)
- **Docker & Docker Compose**
- **Ollama** (installed locally)
    - You must pull the embedding and chat models used by the plugin and query engine:
      ```bash
      ollama pull nomic-embed-text
      ollama pull llava
      ```

## Getting Started

### 1. Start Infrastructure

You can configure the infrastructure (images, ports) via a `cypressAiReport.json` file in your project root (see Configuration section).

To apply configuration and start services:

```bash
cd cypress_ai_reporter
npm run setup-infra
docker-compose up -d
```

This will start Elasticsearch (default: `http://localhost:9200`) and Kibana (default: `http://localhost:5601`).

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

## Integration with Your Custom Cypress Project

To use this reporter in your own existing Cypress project:

1.  **Install the Package**:
    ```bash
    npm install cypress-ai-reporter
    ```
    *(Note: If building locally, point to the local path or tarball)*

2.  **Register the Plugin**:
    Edit your `cypress.config.{js,ts}` to include the reporter in the `setupNodeEvents` function.

    ```javascript
    const { defineConfig } = require("cypress");
    const { cypressAiReporter } = require("cypress-ai-reporter");

    module.exports = defineConfig({
      e2video: true, // Enable video recording
        setupNodeEvents(on, config) {
          // Register the AI reporter
          cypressAiReporter(on, config);
          return config;
        },
      },
    });
    ```

    *Recommended*: To enable advanced step-by-step reporting and prompt context, add the following to your `cypress/support/e2e.js` (or `support/index.js`):

    ```javascript
    import './commands'
    
    // Test Step Logger
    const steps = [];
    beforeEach(() => { steps.length = 0; });
    
    Cypress.on('command:start', (command) => {
      if (command.attributes.name !== 'task') {
        steps.push({ name: command.attributes.name, args: command.attributes.args });
      }
    });
    
    afterEach(function () {
      cy.task('logTestSteps', {
        spec: Cypress.spec.name,
        title: this.currentTest.title,
        steps: steps
      });},
      },
    });
    ```

3.  **Add Configuration**:
    Create a `cypressAiReport.json` in your project root to configure the connection to Elasticsearch and Ollama.

    ```json
    {
      "elasticNode": "http://localhost:9200",
      "indexName": "cypress-test-logs",
      "ollamaUrl": "http://localhost:11434",
      "chatModel": "llava"
    }
    ```

4.  **Ensure Backend is Running**:
    Make sure the Elasticsearch and Ollama services are running (see "Start Infrastructure" above) and accessible from the machine running your tests.

## Configuration

You can configure the plugin using a `cypressAiReport.json` file in your project root. This file handles both plugin behavior and infrastructure settings.

**Example `cypressAiReport.json`:**

```json
{
  "elasticNode": "http://localhost:9201",
  "indexName": "cypress-test-logs",
  "ollamaUrl": "http://localhost:11434",
  "embeddingModel": "nomic-embed-text",
  "chatModel": "llava",
  "Features

- **AI Failure Analysis**: Automatically analyzes failed tests using Ollama (LLaVA) and provides a summary.
- **Detailed Reporting**: Generates JSON reports, captures videos of failures, and logs execution steps.
- **Semantic Search**: Indexes test errors and titles into Elasticsearch for natural language querying.
- **Historical Data & Video Processing**:
    - The plugin scans `${reportDir}/setup` for historical logs `.json` and video files `.mp4` on startup.
    - Videos are chunked and processed using OpenCV to generate image embeddings, allowing multimodal search capabilities.

## AI Analysis Reports

After every test run, the plugin automatically:
1.  Analyzes failures using the configured LLM (`chatModel`).
2.  Prints a concise summary to the console (formatted as "On [Page], when [Action], then [Failure]").
3.  Generates a detailed JSON report in the configured `reportDir` (default: `cypress/reports`).
4.  Saves video recordings and detailed step logs for failed tests alongside the report
```

- **Plugin Settings**: Used by Cypress during test execution (`elasticNode`, `chatModel`, `reportDir`, etc.)
- **Infrastructure Settings**: Used by `npm run setup-infra` to configure Docker (`elasticPort`, `elasticImage`, etc.)

Alternatively, you can pass options directly in `cypress.config.js` (these override `cypressAiReport.json` for plugin execution, but do not affect infrastructure):

```javascript
const { defineConfig } = require("cypress");
const { cypressAiReporter } = require("cypress-ai-reporter");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      cypressAiReporter(on, config);
    },
  },
});
```

## AI Analysis Reports

After every test run, the plugin automatically:
1.  Analyzes failures using the configured LLM (`chatModel`).
2.  Prints a concise summary to the console (formatted as "On [Page], when [Action 1] and [Action 2]..., the [Error] on [Last Action]").
3.  Generates a detailed JSON report in the configured `reportDir` (default: `cypress/reports`).

Example JSON Report:
```json
{
  "timestamp": "2026-01-14T07:05:34.922Z",
  "aiAnalysis": "On the example to-do app, when attempting to filter for uncompleted tasks, the test timed out after 4000ms and was unable to find enough elements. Found 1, expected 10.",
  "tests": [ ... ]
}
```

const { defineConfig } = require("cypress");
const { cypressAiReporter } = require("cypress-ai-reporter");



module.exports = defineConfig({
  e2e: {
    video: true,
    // reporter: 'cypress_ai_reporter',
    // reporterOptions: {
    //   mochaFile: 'results/my-test-output.xml',
    //   toConsole: true,
    // },
    setupNodeEvents(on, config) {
      cypressAiReporter(on, config);
    },
  },
});``

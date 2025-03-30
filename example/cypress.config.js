const { defineConfig } = require("cypress");
const cypress_ai_reporter = require("cypress_ai_reporter");



module.exports = defineConfig({
  e2e: {
    video: true,
    reporter: 'cypress_ai_reporter',
    reporterOptions: {
      mochaFile: 'results/my-test-output.xml',
      toConsole: true,
    },
    setupNodeEvents(on, config) {
      // implement node event listeners here
   
    },
  },
});``

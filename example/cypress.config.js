const { defineConfig } = require("cypress");
const CustomReporter = require('./reporter');


module.exports = defineConfig({
  e2e: {
    video: true,
    reporter: 'reporter.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
   
    },
  },
});

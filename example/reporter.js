// cypress/support/reporter.js

class CustomReporter {
      this.runner = runner;
      this.options = options;
      this.results = {
        total: 0,
        passes: 0,
        failures: 0,
        pending: 0,
        skipped: 0,
        tests: [],
        startTime: new Date(),
        endTime: null,
      
  
      runner.on('start', () => {
        console.log('--- Custom Cypress Reporter ---');
        this.results.startTime = new Date();
      });
  
      runner.on('test', (test) => {
        this.results.total++;
        this.results.tests.push({
          title: test.title.join(' > '),
          state: 'pendingsssssssssssssssssssssssss',
          duration: 0,
          err: null,
          startTime: new Date(),
          endTime: null,
        });
      });
  
      runner.on('pass', (test) => {
        this.results.passes++;
        const currentTest = this.results.tests.find(t => t.title === test.title.join(' > '));
        if (currentTest) {
          currentTest.state = 'passedsssssssssssssssss';
          currentTest.duration = test.duration;
          currentTest.endTime = new Date();
        }
      });
  
      runner.on('fail', (test, err) => {
        this.results.failures++;
        const currentTest = this.results.tests.find(t => t.title === test.title.join(' > '));
        if (currentTest) {
          currentTest.state = 'failedsssssssssssssss';
          currentTest.duration = test.duration;
          currentTest.err = {
            message: err.message,
            stack: err.stack,
          };
            currentTest.endTime = new Date();
        }
      });
  
      runner.on('pending', (test) => {
        this.results.pending++;
        const currentTest = this.results.tests.find(t => t.title === test.title.join(' > '));
        if (currentTest) {
          currentTest.state = 'pendingssssssssssssssssss';
          currentTest.endTime = new Date();
        }
      });
  
      runner.on('skipped', (test) => {
        this.results.skipped++;
        const currentTest = this.results.tests.find(t => t.title === test.title.join(' > '));
        if (currentTest) {
          currentTest.state = 'skippedssssssssssssssss';
          currentTest.endTime = new Date();
        }
      });
  
      runner.on('end', () => {
        this.results.endTime = new Date();
        this.printResults();
      });
    }
  
    printResults() {
      console.log('\n--- Test Resultsssssssssssssssssssssss ---');
      console.log(`Total Tests: ${this.results.total}`);
      console.log(`Passed: ${this.results.passes}`);
      console.log(`Failed: ${this.results.failures}`);
      console.log(`Pending: ${this.results.pending}`);
      console.log(`Skipped: ${this.results.skipped}`);
  
      console.log('\n--- Test Details ---');
      this.results.tests.forEach((test) => {
        console.log(`\n${test.title}`);
        console.log(`  State: ${test.state}`);
        console.log(`  Duration: ${test.duration}ms`);
        if (test.err) {
          console.log(`  Error: ${test.err.message}`);
          if(this.options && this.options.showStackTraces){
            console.log(`  Stack: ${test.err.stack}`);
          }
        }
      });
  
      console.log('\n--- Summaryssssssssssssssssssssssssssssssssssssssssssssssssssss ---');
      console.log(`Start Time: ${this.results.startTime}`);
      console.log(`End Time: ${this.results.endTime}`);
      const totalDuration = this.results.endTime - this.results.startTime;
      console.log(`Total Duration: ${totalDuration}ms`);
    }
  }
  
  CustomReporter
  module.exports = CustomReporter;
import  Mocha, { Runner ,Stats } from 'mocha';
const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,

  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,

  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Mocha.Runner.constants;

// readonly EVENT_HOOK_BEGIN: 'hook';
// readonly EVENT_HOOK_END: 'hook end';
// readonly EVENT_RUN_BEGIN: 'start';
// readonly EVENT_DELAY_BEGIN: 'waiting';
// readonly EVENT_DELAY_END: 'ready';
// readonly EVENT_RUN_END: 'end';
// readonly EVENT_SUITE_BEGIN: 'suite';
// readonly EVENT_SUITE_END: 'suite end';
// readonly EVENT_TEST_BEGIN: 'test';
// readonly EVENT_TEST_END: 'test end';
// readonly EVENT_TEST_FAIL: 'fail';
// readonly EVENT_TEST_PASS: 'pass';
// readonly EVENT_TEST_PENDING: 'pending';
// readonly EVENT_TEST_RETRY: 'retry';

// this reporter outputs test results, indenting two spaces per suite

class CypresAiReporter{

  constructor(runner:Runner) {
    const stats =runner.stats 

    runner
      .on(EVENT_RUN_BEGIN, () => {
        console.log('start ======================');
      })
      .on(EVENT_SUITE_BEGIN, () => {
     console.log(EVENT_SUITE_BEGIN);

      })
      .on(EVENT_SUITE_END, () => {
        console.log(EVENT_SUITE_END);
        ;
      })
      .on(EVENT_TEST_PASS, test => {
        // Test#fullTitle() returns the suite name(s)
        // prepended to the test title
        console.log(`pass: ${test.fullTitle()}`);
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        console.log(
          `fail: ${test.fullTitle()} - error: ${err.message}`
        );
      })
      .once(EVENT_RUN_END, () => {
        // console.log(`end: ${stats.passes}/${stats.passes + stats.failures} ok`);
        console.log(`end: ${EVENT_RUN_END} ${stats?.duration} ok`);

      });
  }

 
}

module.exports = CypresAiReporter;
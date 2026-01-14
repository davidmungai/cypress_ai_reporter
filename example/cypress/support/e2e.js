// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

const steps = [];

beforeEach(() => {
    steps.length = 0;
});

Cypress.on('command:start', (command) => {
    if (command.attributes.name !== 'task') {
        steps.push({
            name: command.attributes.name,
            args: command.attributes.args,
        });
    }
});

afterEach(function () {
    const currentTest = this.currentTest;
    // Handle retries or only save on final attempt? 
    // For now, save every attempt or just the last one.
    // Using cy.task here:
    cy.task('logTestSteps', {
        spec: Cypress.spec.name,
        title: currentTest.title,
        steps: steps
    });
});

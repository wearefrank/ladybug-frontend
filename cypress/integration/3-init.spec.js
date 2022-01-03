// init.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe('Ladybug simple protractor test', function() {
  it('Confirm title of ladybug app', function() {
    cy.visit('');
    // Please update the version here when you update the version in package.json
    cy.title().should('eq', 'Ladybug - v0.0.15');
  });

  it('Create first two report', function() {
    cy.createReport();
    cy.createOtherReport();
  })
});

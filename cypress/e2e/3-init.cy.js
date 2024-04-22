// init.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe('Ladybug simple protractor test', () => {

  beforeEach(() => {
    cy.resetApp();
  });

  it('Confirm title of ladybug app', () => {
    cy.title().should('match', /Ladybug - v[0-9]+.[0-9]+.[0-9]+/);
  });
});

import { showSkipped } from "cypress/support/commands";

describe('Test toast window', () => {
  if(Cypress.env('selection') !== "default") {
    showSkipped()
    return
  }

  before(() => cy.resetApp());

  beforeEach(() => cy.initializeApp());

  afterEach(() => cy.resetApp());

  it('When new report appears in table then toast window shown', () => {
    cy.assertDebugTableLength(0);
    cy.createReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.get('[data-cy-toast]').contains('Data loaded!');
    cy.assertDebugTableLength(1);
  });
});

import { showSkipped } from "cypress/support/commands";

describe('Tests for custom editor in debug tab', () => {
  if(Cypress.env('selection') !== "default") {
    showSkipped()
    return
  }

  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('should set xml as available view if editor content is xml file', () => {
    cy.clickRowInTable(0);
    cy.clickRootNodeInFileTree();
    cy.get('[data-cy-editor="viewDropDown"]').as('viewDropDown').find('option:selected').should('contain.text', 'Raw');
    // eslint-disable-next-line sonarjs/no-duplicate-string
    cy.get('@viewDropDown').find('option').should('have.length', 2);
    cy.get('@viewDropDown').find('option').eq(0).should('contain.text', 'Raw');
    cy.get('@viewDropDown').find('option').eq(1).should('contain.text', 'Xml');
    cy.get('@viewDropDown').find('option').eq(2).should('not.exist');
  });

  it('should apply effect based on selected view', () => {
    cy.clickRowInTable(0);
    cy.clickRootNodeInFileTree();
    cy.get('[data-cy-editor="viewDropDown"]').as('viewDropDown');
    let numberOfLines = 0;
    cy.get('div.line-numbers').then((elements) => {
      numberOfLines = elements.length;
    });
    cy.get('@viewDropDown').select('Xml');
    cy.wait(150);
    cy.get('div.line-numbers').then((elements) => {
      expect(elements.length).to.be.greaterThan(numberOfLines);
    });
    cy.get('@viewDropDown').select('Raw');
    cy.wait(150);
    cy.get('div.line-numbers').then((elements) => {
      expect(elements.length).to.eq(numberOfLines);
    });
  });
});

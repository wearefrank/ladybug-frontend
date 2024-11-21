import { showSkipped } from "cypress/support/commands";

describe('Tests for report transformation', () => {
  if(Cypress.env('selection')) {
    showSkipped()
    return
  }

  before(() => cy.resetApp());

  afterEach(() => cy.resetApp());

  afterEach(() => {
    cy.clearDebugStore();
    cy.get('[data-cy-debug="openSettings"]').click();
    // Factory reset in settings dialog. Resets
    // transformation to factory value.
    cy.get('[data-cy-settings="factoryReset"]').click();
    cy.get('[data-cy-settings="saveChanges"]').click();
  });

  it('Should see updated metadata when updating transformation field', () => {
    cy.visit('');
    cy.get('[data-cy-debug="openSettings"]').click();
    cy.get('textarea[formcontrolname=transformation]').type('{selectAll}{del}');
    cy.get('textarea[formcontrolname=transformation]').within((textArea) => {
      cy.fixture('ignoreName.xslt').then((newText) => cy.wrap(textArea).type(newText));
    });
    cy.get('input[type=checkbox][formcontrolname=transformationEnabled]').check();
    cy.get('[data-cy-settings="saveChanges"]').click();
    cy.createOtherReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.assertDebugTableLength(1).click();
    cy.checkFileTreeLength(1);
    cy.clickRootNodeInFileTree();
    cy.get('[data-cy-open-metadata-table]').click();
    cy.get('[data-cy-element-name="editor"]').contains('Name="IGNORED"');
    // The transformation should not affect the report table, only the XML in the Monaco editor
    cy.get('[data-cy-metadata-table="reportname"]').should('have.text', 'Another simple report');
  });
});

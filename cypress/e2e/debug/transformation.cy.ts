describe('Tests for report transformation', () => {
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
    cy.wait(100);
    cy.assertDebugTableLength(1).click();
    cy.checkFileTreeLength(1);
    // We test that the top node was not selected before.
    // cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li > div').click();
    cy.get('[data-cy-open-metadata-table]').click();
    cy.get('[data-cy-element-name="editor"]').contains('Name="IGNORED"');
    // The transformation should not affect the report table, only the XML in the Monaco editor
    cy.get('[data-cy-metadata-table="reportname"]').should('have.text', 'Another simple report');
  });
});

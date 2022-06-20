describe('Report transformation', function() {
  afterEach(function() {
    cy.clearDebugStore();
    cy.get('#SettingsButton').click();
    // Factory reset in settings dialog. Resets
    // transformation to factory value.
    cy.get('button[title ^= "Reset to factory settings"]').click();
    cy.get('button[type=submit]').click();
  });

  it('Update transformation', function() {
    cy.visit('');
    cy.get('#SettingsButton').click();
    cy.get('textarea[formcontrolname=transformation]').type('{selectAll}');
    cy.get('textarea[formcontrolname=transformation]').type('{del}');
    cy.get('textarea[formcontrolname=transformation]').within((textArea) => {
      cy.fixture('ignoreName.xslt').then((newText) => cy.wrap(textArea).type(newText));
    });
    cy.get('input[type=checkbox][formcontrolname=transformationEnabled]').check();
    cy.get('button[type=submit]').click();
    cy.createOtherReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1).click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    // We test that the top node was not selected before.
    cy.get('div.treeview > ul > li:eq(0)').click();
    cy.get('#monacoEditor').contains('Name="IGNORED"');
    // The transformation should not affect the report table, only the XML in the Monaco editor
    cy.get('#displayedNodeTable tr:eq(0) td:eq(0)').should('have.text', 'Name');
    cy.get('#displayedNodeTable tr:eq(0) td:eq(1)').should('have.text', 'Another simple report');
  });
});
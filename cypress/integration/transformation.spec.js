describe('Report transformation', function() {
  afterEach(function() {
    cy.clearDebugStore();
    /*
    cy.get('#SettingsButton').click();
    // Factory reset in settings dialog. Resets
    // transformation to factory value.
    cy.get('.model-footer :eq(0)').click();
    cy.get('button[type=submit]').click();
    */
  });

  it('Update transformation', function() {
    cy.visit('');
    /*
    cy.createOtherReport();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1).click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    cy.get('div.treeview > ul > li:eq(0)').click();
    cy.get('#monacoEditor').contains('Name="otherName"');
    */
    cy.get('#SettingsButton').click();
    cy.get('textarea[formcontrolname=transformation]').type('{selectAll}');
    cy.get('textarea[formcontrolname=transformation]').type('{del}');
    cy.get('textarea[formcontrolname=transformation]').within((textArea) => {
      cy.fixture('ignoreName.xslt').then((newText) => cy.wrap(textArea).type(newText));
    });
    cy.get('button[type=submit]').click();
    cy.get('#RefreshButton').click();
    cy.createOtherReport();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1).click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    cy.get('div.treeview > ul > li:eq(0)').click();
    cy.get('#monacoEditor').contains('Name="IGNORE"');
  });
});
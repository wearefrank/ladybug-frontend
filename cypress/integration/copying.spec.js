describe('Tests about copying', function() {
  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Copy report to test tab', () => {
    cy.visit('');
    cy.get('#testTab').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 0);
    cy.createReport();
    cy.get('#debugTab').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 0);
    cy.get('#RefreshButton').click();
    cy.get('#metadataTable tbody').find('tr').should('have.length', 1);
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    // :eq expects a zero-based index
    cy.get('div.treeview > ul > li:eq(1)').click();
    // TODO: Cannot continue until issue https://github.com/ibissource/ladybug-frontend/issues/70
    // has been fixed
  });
});
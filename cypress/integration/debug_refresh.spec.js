describe('Refresh', function() {
  afterEach(() => {
    cy.clearDebugStore();
  });

  it('New reports are only shown on refresh', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').should('have.length', 0);
    cy.createReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').should('have.length', 1);
  });
})
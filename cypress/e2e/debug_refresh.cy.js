describe('Refresh', function() {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  it('New reports are only shown on refresh', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.createReport();
    cy.get('#RefreshButton').click();
    cy.wait(100)
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
  });
})
describe('Refresh', function() {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  it('New reports are only shown on refresh', function() {
    cy.visit('');
    cy.get("[data-cy-debug='tableBody']").find('tr').should('not.exist');
    cy.createReport();
    cy.get("[data-cy-debug='refresh']").click();
    cy.wait(100)
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 1);
  });
})

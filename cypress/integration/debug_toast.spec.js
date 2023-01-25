describe('Test toast window', function() {
  beforeEach(function() {
    cy.clearDebugStore();
  });

  it('When new report appears in table then toast window shown', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.createReport();
    cy.get('#RefreshButton').click();
    cy.wait(100)
    cy.get('.alert').contains('Data loaded!');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
  })
});

describe('Test toast window', function() {
  afterEach(function() {
    cy.clearDebugStore();
  });

  it('When new report appears in table then toast window shown', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.createReport();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.get('#RefreshButton').click();
    cy.get('.alert').contains('Data loaded!');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
  })
});
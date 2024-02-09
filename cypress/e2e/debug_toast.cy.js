describe('Test toast window', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.initializeApp();
  });

  it('When new report appears in table then toast window shown', () => {
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.createReport();
    cy.get('[data-cy-debug=\'refresh\']').click();
    cy.wait(100);
    cy.get('[data-cy-toast]').contains('Data loaded!');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
  });
});

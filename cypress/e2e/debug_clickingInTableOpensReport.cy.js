describe('Clicking a report', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  it('Selecting report should show a tree', () => {
    cy.get('#treeButtons').should('not.be.visible');
    cy.get('.table-responsive tbody').find('tr').first().click();
    cy.get('#treeButtons').should('be.visible');
  });

  it('Selecting report should show display', () => {
    cy.get('#displayButtons').should('not.exist');
    cy.get('[data-cy-element-name="editor"]').should('not.exist');
    cy.get('.table-responsive tbody').find('tr').first().click();
    cy.get('#displayButtons').should('be.visible');
    cy.get('[data-cy-element-name="editor"]').should('be.visible');
  });
});

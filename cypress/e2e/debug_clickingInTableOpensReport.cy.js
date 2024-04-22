describe('Clicking a report', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  it('Selecting report should show a tree', () => {
    cy.get('[data-cy-debug-tree="buttons"]').should('not.exist');
    cy.get('[data-cy-debug="tableBody"]').find('tr').first().click();
    cy.get('[data-cy-debug-tree="buttons"]').should('be.visible');
  });

  it('Selecting report should show display', () => {
    cy.get('[data-cy-debug-editor="buttons"]').should('not.exist');
    cy.get('[data-cy-element-name="editor"]').should('not.exist');
    cy.get('[data-cy-debug="tableBody"]').find('tr').first().click();
    cy.get('[data-cy-debug-editor="buttons"]').should('be.visible');
    cy.get('[data-cy-element-name="editor"]').should('be.visible');
  });
});

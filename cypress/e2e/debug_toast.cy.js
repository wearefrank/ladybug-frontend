describe('Test toast window', () => {
  before(() => cy.resetApp());

  beforeEach(() => cy.initializeApp());

  afterEach(() => cy.resetApp());

  it('When new report appears in table then toast window shown', () => {
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('not.exist');
    cy.createReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.wait(100);
    cy.get('[data-cy-toast]').contains('Data loaded!');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
  });
});

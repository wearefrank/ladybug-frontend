describe('Refresh', () => {
  before(() => {
    cy.resetApp();
  });

  beforeEach(() => cy.initializeApp());

  afterEach(() => cy.resetApp());

  it('New reports are only shown on refresh', () => {
    cy.get('[data-cy-debug="tableBody"]').get('tbody').find('tr').should('not.exist');
    cy.createReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.wait(100);
    cy.get('[data-cy-debug="tableBody"]').get('tbody').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug="amountShown"]').invoke('text').should('contain', '1');
  });
});
``

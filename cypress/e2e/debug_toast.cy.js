describe('Test toast window', () => {
  before(() => cy.resetApp());

  beforeEach(() => cy.initializeApp());

  afterEach(() => cy.resetApp());

  it('When new report appears in table then toast window shown', () => {
    cy.assertDebugTableLength(0);
    cy.createReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.wait(100);
    cy.get('[data-cy-toast]').contains('Data loaded!');
    cy.functions.assertDebugTableLength(1);
  });
});

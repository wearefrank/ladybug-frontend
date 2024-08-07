describe('Testing table', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Sorting the table by column name', () => {
    cy.getTableRows().first().contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRows().first().contains("Another simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRows().first().contains("Simple report");
  });

  it('Refresh to reset table to default', () => {
    cy.getTableRows().first().contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.get('[data-cy-debug="refresh"]').click()
    cy.getTableRows().first().contains("Simple report");
  })
});

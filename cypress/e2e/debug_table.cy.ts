describe('Testing table', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Sorting the table by column name', () => {
    cy.getTableRow(0).contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRow(0).contains("Another simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRow(0).contains("Simple report");
  });

  it('Refresh to reset table to default', () => {
    cy.getTableRow(0).contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.get('[data-cy-debug="refresh"]').click()
    cy.getTableRow(0).contains("Simple report");
  })
});

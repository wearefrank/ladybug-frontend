describe('Testing table', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport()
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Sorting the table by column name', () => {
    cy.getTableBody().find('tr').eq(0).find('td').eq(4).contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableBody().find('tr').eq(0).find('td').eq(4).contains("Another simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableBody().find('tr').eq(0).find('td').eq(4).contains("Simple report");
  });

  it('Refresh to reset table to default', () => {
    cy.getTableBody().find('tr').eq(0).find('td').eq(4).contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.get('[data-cy-debug="refresh"]').click()
    cy.getTableBody().find('tr').eq(0).find('td').eq(4).contains("Simple report");
  })
});

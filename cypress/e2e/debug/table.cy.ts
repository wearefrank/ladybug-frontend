describe('Testing for Debug tab table', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Should sort by column naming when clicking on table column header', () => {
    cy.getTableRows().first().contains("Simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRows().first().contains("Another simple report");
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRows().first().contains("Simple report");
  });

  it('Should still be ordered when refreshing table.', () => {
    cy.get('[data-cy-debug="metadataLabel"]').eq(3).click();
    cy.getTableRows().first().contains("Another simple report");
    cy.get('[data-cy-debug="refresh"]').click()
    cy.getTableRows().first().contains("Another simple report");
  })
});

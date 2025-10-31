describe('Report buttons', () => {
  before(() => cy.resetApp());

  afterEach(() => {
    cy.clearDebugStore();
  });

  // We omit testing that a Larva test was actually created.
  it('When custom report action is done from checkpoint node then success toast is shown', () => {
    cy.visit('');
    cy.createReport();
    cy.get('[data-cy-debug="refresh"]').click();
    cy.assertDebugTableLength(1).click();
    cy.checkFileTreeLength(1);
    cy.get('[data-cy-report-buttons="customReportAction"]').click();
    cy.get(':contains(Success for reports: [Simple report])').should('be.visible');
    cy.get(':contains(Failure!)').should('be.visible');
    cy.get(':contains(Success for reports: [Simple report])', {timeout: 10000}).should('not.exist');
  });
});

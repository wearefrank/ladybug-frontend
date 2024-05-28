describe('Tests about copying', function() {
  before(() => {
    cy.resetApp();
  });

  beforeEach(() => cy.initializeApp());

  afterEach(() => {
    cy.resetApp();
  });

  it('Copy report to test tab', () => {
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.checkTestTableNumRows(0);
    cy.get('[data-cy-nav-tab="debugTab"]').click();
    cy.checkTableNumRows(0);
    cy.createReport();
    cy.refreshApp();
    cy.checkTableNumRows(1);
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.debugTreeGuardedCopyReport('Simple report', 3, '');
    cy.get('[data-cy-nav-tab="testTab"]').click();
    // We test that the user does not have to refresh here.
    cy.checkTestTableReportsAre(['Simple report']);
    cy.get('[data-cy-nav-tab="debugTab"]').click();
    cy.checkTableNumRows(1);
    cy.clickRowInTable(0);
    cy.checkFileTreeLength(1);
    cy.get('[data-cy-nav-tab="testTab"]').click();
    // Do not refresh. The test tab should have saved its state.
    cy.checkTestTableReportsAre(['Simple report']);
  });
});

describe('About the Test tab', () => {
  before(() => {
    cy.resetApp();
  });

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
    copyTheReportsToTestTab();
    cy.navigateToTestTabAndWait();
  });

  afterEach(() => cy.resetApp());

  it('Test deleting a report', () => {
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="table"]').contains('Simple report').parent('tr').find('[data-cy-test="reportChecked"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableReportsAre(['Another simple report']);
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('Test select all by deleting', () => {
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableNumRows(0);
  });

  it('Test deselect all', () => {
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('should keep rerun results after switching tabs', () => {
    cy.get('[data-cy-test="runReport"]').eq(0).click();
    cy.get('[data-cy-test="runResult"]').should('be.visible');
    cy.get('[data-cy-test="compareReport"]').eq(0).click();
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.get('[data-cy-test="runResult"]').should('be.visible');
  });
});

function copyTheReportsToTestTab() {
  cy.enableShowMultipleInDebugTree();
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="openSelected"]').click();
  // We test many times already that opening two reports yields six nodes.
  // Adding the test here again has another purpose. We want the DOM to
  // be stable before we go on with the test. Without this guard, the test
  // was flaky because the selectIfNotSelected() custom command accessed
  // a detached DOM element.
  cy.wait(100);
  cy.checkFileTreeLength(2);
  cy.wait(100);
  // TODO: Uncomment this line when the sequence in the debug tree has been fixed.
  // cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(0).find('.item-name').eq(0).click();
  // TODO: And at that time also remove the line below.
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Simple report').click();
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Simple report', 3, 'first');
  cy.wait(100);
  // TODO: Same as above.
  // cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(1).find('.item-name').eq(0).click();
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Another simple report').click();
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Another simple report', 3, 'second');
  cy.wait(1000);
}

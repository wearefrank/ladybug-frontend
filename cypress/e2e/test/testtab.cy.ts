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

  it('Should delete one report at a time with deleteSelected button', () => {
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="table"]').contains('Simple report').parent('tr').find('[data-cy-test="reportChecked"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableReportsAre(['Another simple report']);
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('Should delete all tests with deleteSelected button', () => {
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableNumRows(0);
  });

  it('Should not open delete modal when clicking on deleteSelected button and there are no tests selected', () => {
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('Should delete all tests with deleteAll button', () => {
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="toggleSelectAll"]').click();
    cy.get('[data-cy-test="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableNumRows(0);
  });

  it('Should not open delete modal when there are no tests', () => {
    cy.get('[data-cy-test="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').should('exist').click();
    cy.get('[data-cy-test="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').should('not.exist');
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').should('not.exist');
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

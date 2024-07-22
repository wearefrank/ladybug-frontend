describe('About the Test tab', () => {
  before(() => {
    cy.resetApp();
  });

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
    const storageIds: string[] = [];
    cy.getTableBody().find('tr').each($row => {
      cy.wrap($row).find('td:eq(1)').invoke('text').then(s => {
        storageIds.push(s);
        cy.log(`Table has storage id ${s}`);
      });
    });
    cy.getTableBody().find('tr').then(() => {
      cy.log(`Table has storage ids: [${storageIds}]`);
    });
    // When making videos is enabled, the number of frames is limited.
    // We want to see these storage ids. This is the reason for this wait.
    cy.wait(2000);
    // When https://github.com/wearefrank/ladybug-frontend/issues/439 will have been fixed,
    // make the argument true. Then this function can be refactored to have no argument again.
    copyTheReportsToTestTab();
  });

  afterEach(() => cy.resetApp());

  it('Test deleting a report', () => {
    cy.navigateToTestTabAndWait();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="deselectAll"]').click();
    cy.get('[data-cy-test="table"]').contains('Simple report').parent('tr').find('[data-cy-test="reportChecked"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableReportsAre(['Another simple report']);
    cy.get('[data-cy-test="selectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('Test select all by deleting', () => {
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    checkTestTabTwoReportsSelected();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableNumRows(0);
  });

  it('Test deselect all', () => {
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.wait(100);
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    checkTestTabTwoReportsSelected();
    cy.get('[data-cy-test="deselectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.wait(1000);
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
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
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Simple report').click()
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Simple report', 3, 'first');
  cy.wait(100);
  // TODO: Same as above.
  // cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(1).find('.item-name').eq(0).click();
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Another simple report').click()
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Another simple report', 3, 'second');
  cy.wait(1000);
}

function checkTestTabTwoReportsSelected() {
  cy.get('[data-cy-test="table"] tr [type=checkbox]')
    .should('have.length', 2)
    .each(($checkbox) => {
      cy.wrap($checkbox).should('be.checked');
    });
}

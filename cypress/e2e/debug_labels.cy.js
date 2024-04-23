describe('Test labels', () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  afterEach(() => {
    cy.get('[data-cy-debug-tree="closeAll"]').click();
  });

  it('Test label null', () => {
    cy.createReportWithLabelNull();
    cy.initializeApp();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.wait(300);
    cy.checkFileTreeLength(1);
    testTreeView('Message is null', 'Null String');
  });

  it('Test label empty string', () => {
    cy.createReportWithLabelEmpty();
    cy.initializeApp();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.checkFileTreeLength(1);
    testTreeView('Message is an empty string', 'Empty String');
  });
});

function testTreeView(reportName, labelString) {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item .item-name').eq(0).within(
    function($node) {
      cy.wrap($node).should('contain', reportName);
    },
  );

  cy.get('[data-cy-debug-tree="root"] > app-tree-item > div')
    .eq(0)
    .get('div > app-tree-icon img')
    .as('tree-icons');

  cy.get('@tree-icons').eq(0)
    .invoke('attr', 'src')
    .should('eq', 'assets/tree-icons/startpoint-even.gif');

  cy.get('@tree-icons').eq(1)
    .invoke('attr', 'src')
    .should('eq', 'assets/tree-icons/infopoint-odd.gif');

  cy.get('@tree-icons').eq(2)
    .invoke('attr', 'src')
    .should('equal', 'assets/tree-icons/endpoint-odd.gif');
}

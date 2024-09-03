describe('Test labels', () => {
  before(() => cy.resetApp());

  afterEach(() => {
    cy.get('[data-cy-debug-tree="closeAll"]').click();
    cy.resetApp();
  });

  it('Test label null', () => {
    cy.createReportWithLabelNull();
    cy.initializeApp();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.checkFileTreeLength(1);
    testTreeView('Message is null');
  });

  it('Test label empty string', () => {
    cy.createReportWithLabelEmpty();
    cy.initializeApp();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.checkFileTreeLength(1);
    testTreeView('Message is an empty string');
  });
});

function testTreeView(reportName: string): void {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item .item-name')
    .eq(0)
    .within(function ($node) {
      cy.wrap($node).should('contain', reportName);
    });

  cy.get('[data-cy-debug-tree="root"] > app-tree-item > div')
    .eq(0)
    .get('div > app-tree-icon img')
    .as('tree-icons');

  cy.get('@tree-icons').eq(0)
    .invoke('attr', 'src')
    .should('eq', 'assets/tree-icons/startpoint.svg');

  cy.get('@tree-icons').eq(0)
    .should('have.class', 'tree-checkpoint-even');

  cy.get('@tree-icons').eq(1)
    .invoke('attr', 'src')
    .should('eq', 'assets/tree-icons/infopoint.svg');

  cy.get('@tree-icons').eq(1)
    .should('have.class', 'tree-checkpoint-odd');

  cy.get('@tree-icons').eq(2)
    .invoke('attr', 'src')
    .should('equal', 'assets/tree-icons/startpoint.svg');

  cy.get('@tree-icons').eq(2)
    .should('have.class', 'endpoint');
}

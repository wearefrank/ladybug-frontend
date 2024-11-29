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
    .get('div > app-tree-icon div.sft-icon-container i')
    .as('tree-icons');

  cy.get('@tree-icons').eq(1)
    .should('satisfy', ($el) => {
      const classList = Array.from($el[0].classList);
      return classList.includes('bi') && classList.includes('bi-arrow-bar-right');
    })

  cy.get('@tree-icons').eq(2)
    .should('satisfy', ($el) => {
      const classList = Array.from($el[0].classList);
      return classList.includes('bi') && classList.includes('bi-info-square');
    })

  cy.get('@tree-icons').eq(3)
    .should('satisfy', ($el) => {
      const classList = Array.from($el[0].classList);
      return classList.includes('bi') && classList.includes('bi-arrow-bar-left');
    })
}

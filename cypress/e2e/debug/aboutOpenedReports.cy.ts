describe('About opened reports', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Close one', () => {
    cy.enableShowMultipleInDebugTree();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    // Each of the two reports has three lines.
    cy.checkFileTreeLength(2);
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div').should('contain', 'Simple report');
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div > div:contains(Simple report)')
      .first()
      .selectIfNotSelected();
    cy.get('[data-cy-debug-editor="close"]').click();
    cy.get('[data-cy-debug-tree="root"] > app-tree-item .item-name')
      .should('contain', 'Another simple report')
      .eq(0)
      .click();
    cy.get('[data-cy-debug-tree="closeAll"]').click();
    cy.get('[data-cy-debug-tree="root"] app-tree-item').should('not.exist');
  });

  it('Close all', () => {
    cy.enableShowMultipleInDebugTree();
    cy.getDebugTableRows().find('td:contains(Simple report)').first().click();
    cy.checkFileTreeLength(1);
    cy.getDebugTableRows().find('td:contains("Another simple report")').first().click();
    cy.checkFileTreeLength(2);
    // Check sequence of opened reports. We expect "Simple report" first, then "Another simple report".
    cy.get('[data-cy-debug-tree="root"] > app-tree-item:nth-child(1) > div > .sft-item > .item-name').should(
      'have.text',
      'Simple report',
    );
    cy.get('[data-cy-debug-tree="root"] > app-tree-item:nth-child(2) > div > .sft-item > .item-name')
      .eq(0)
      .should('have.text', 'Another simple report');
    cy.get('[data-cy-debug-tree="closeAll"]').click();
    cy.get('[data-cy-debug-tree="root"] app-tree-item').should('not.exist');
  });

  it('Correct nesting in debug tree for report with infopoint', () => {
    cy.createReportWithInfopoint();
    cy.initializeApp();
    cy.getDebugTableRows().find('td:contains("Hide a checkpoint in blackbox view")').first().click();
    cy.checkFileTreeLength(1);
    cy.get('[data-cy-debug-tree="root"] app-tree-item app-tree-icon .sft-chevron-container').eq(1).click()
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div > div:contains("Hide this checkpoint")').should(
      'be.hidden',
    );
  });

  it('Correct nesting in debug tree for report with multiple startpoints', () => {
    cy.createReportWithMultipleStartpoints();
    cy.initializeApp();
    cy.getDebugTableRows().find('td:contains("Multiple startpoints")').first().click();
    cy.checkFileTreeLength(1);
    cy.get('[data-cy-debug-tree="root"] app-tree-item app-tree-icon .sft-chevron-container').eq(1).click()
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div > div:contains("Hello infopoint")').should('be.hidden');
    cy.get(
      '[data-cy-debug-tree="root"] app-tree-item > div > div:contains("startpoint 2") > div:contains("Multiple startpoints") > app-tree-item > div > div:contains("Multiple startpoints")',
    )
      .first()
      .selectIfNotSelected()
      .click();
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div > div:contains("startpoint 2")').should('be.hidden');
  });
});

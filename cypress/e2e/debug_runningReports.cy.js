describe('Test running reports', () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  it('If no running reports then number of running reports is zero', () => {
    cy.initializeApp();
    cy.contains('Reports in progress: 0');
  });
});

describe('With running reports', () => {
  beforeEach(() => {
    cy.createRunningReport();
    cy.createRunningReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.removeReportInProgress();
    cy.removeReportInProgress();
  });

  it('Open running reports', () => {
    cy.contains('Reports in progress: 2');
    cy.get('[data-cy-debug=\'refresh\']').click();
    cy.wait(100);
    cy.checkTableNumRows(0);
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('{backspace}');
    cy.get('[data-cy-debug=\'openInProgressNo\']').should('have.text', '');
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('1');
    cy.get('[data-cy-debug=\'openInProgress\']').click();
    cy.contains('Opened report in progress');
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should('have.length', 1);
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li > div").should('have.text', 'Waiting for thread to start');
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li > ul > li > div").should('have.text', 'Waiting for thread to start');
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li > ul > li > ul > li > div").should('include.text', 'Waiting for thread');
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li > ul > li > div").within(($node) => {
      cy.wrap($node).find('img').invoke('attr', 'src').should('eq', 'assets/tree-icons/startpoint-even.gif');
    });
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li > ul > li > ul > li > div").within(($node) => {
      cy.wrap($node).find('img').invoke('attr', 'src').should('eq', 'assets/tree-icons/threadStartpoint-error-odd.gif');
    });
    cy.get('[data-cy-debug-editor=\'close\']').click();
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should('not.exist');
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('{backspace}');
    cy.get('[data-cy-debug=\'openInProgressNo\']').should('have.text', '');
    // The second report, not two reports
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('2');
    cy.get('[data-cy-debug=\'openInProgress\']').click();
    cy.contains('Opened report in progress');
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should('have.length', 1);
    cy.get('[data-cy-debug-editor=\'close\']').click();
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should('not.exist');
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('{backspace}');
    cy.get('[data-cy-debug=\'openInProgressNo\']').should('have.text', '');
    // The third report, should not exist
    cy.get('[data-cy-debug=\'openInProgressNo\']').type('3');
    cy.get('[data-cy-debug=\'openInProgress\']').click();
    cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should('not.exist');
  });
});

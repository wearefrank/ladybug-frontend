describe('Test running reports', function() {
  afterEach(function() {
    cy.clearDebugStore();
  });

  it('If no running reports then number of running reports is zero', function() {
    cy.visit('');
    cy.contains('Reports in progress: 0');
  })

  describe('With running reports', function() {
    beforeEach(function() {
      cy.createRunningReport();
      cy.createRunningReport();
    });

    afterEach(function() {
      cy.removeReportInProgress();
      cy.removeReportInProgress();
    });

    it('Open running reports', function() {
      cy.visit('');
      cy.contains('Reports in progress: 2');
      cy.get('.row #RefreshButton').click();
      cy.wait(100);
      cy.get('#metadataTable tbody').find('tr').should('not.exist');
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', '');
      cy.get('#openInProgressNo').type('1');
      cy.get('#openReportInProgressButton').click();
      cy.contains('Opened report in progress');
      cy.get('.jqx-tree-dropdown-root > li').should('have.length', 1);
      cy.get('.jqx-tree-dropdown-root > li > div').should('have.text', 'Waiting for thread to start');
      cy.get('.jqx-tree-dropdown-root > li > ul > li > div').should('have.text', 'Waiting for thread to start');
      cy.get('.jqx-tree-dropdown-root > li > ul > li > ul > li > div').should('include.text', 'Waiting for thread');
      cy.get('.jqx-tree-dropdown-root > li > ul > li > div').within(function($node) {
        cy.wrap($node).find('img').invoke('attr', 'src').should('eq', 'assets/tree-icons/startpoint-even.gif');
      });
      cy.get('.jqx-tree-dropdown-root > li > ul > li > ul > li > div').within(function($node) {
        cy.wrap($node).find('img').invoke('attr', 'src').should('eq', 'assets/tree-icons/threadStartpoint-error-odd.gif');
      });
      cy.get('#CloseButton').click();
      cy.get('.jqx-tree-dropdown-root > li').should('not.exist');
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', '');
      // The second report, not two reports
      cy.get('#openInProgressNo').type('2');
      cy.get('#openReportInProgressButton').click();
      cy.contains('Opened report in progress');
      cy.get('.jqx-tree-dropdown-root > li').should('have.length', 1);
      cy.get('#CloseButton').click();
      cy.get('.jqx-tree-dropdown-root > li').should('not.exist');
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', '');
      // The third report, should not exist
      cy.get('#openInProgressNo').type('3');
      cy.get('#openReportInProgressButton').click();
      cy.get('.jqx-tree-dropdown-root > li').should('not.exist');
    });
  });
});

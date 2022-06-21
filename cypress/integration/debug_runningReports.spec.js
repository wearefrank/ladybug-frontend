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
      // We wait here for the refresh to take effect. Without waiting.
      // We do not want to test the amount of table rows before refresh.
      cy.wait(5000);
      cy.get('#metadataTable tbody').find('tr').should('have.length', 0);
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', '');
      cy.get('#openInProgressNo').type('1');
      cy.get('#openReportInProgressButton').click();
      cy.contains('Opened report in progress');
      cy.get('div.treeview > ul > li').should('have.length', 3);
      cy.get('div.treeview > ul > li:nth-child(1)').should('have.text', 'Waiting for thread to start');
      cy.get('div.treeview > ul > li:nth-child(2)').should('have.text', 'Waiting for thread to start');
      cy.get('div.treeview > ul > li:nth-child(3)').should('include.text', 'Waiting for thread');
      cy.get('div.treeview > ul > li:nth-child(1) span.fa-minus');
      cy.get('div.treeview > ul > li:nth-child(2)').within(function($node) {
        cy.wrap($node).find('span:nth-child(1).indent');
        cy.wrap($node).find('span:nth-child(2).fa-minus');
        cy.wrap($node).find('span:nth-child(3).node-icon');
        cy.wrap($node).find('img:nth-child(4)').invoke('attr', 'src').should('eq', 'assets/tree-icons/startpoint-even.gif');
      });
      cy.get('div.treeview > ul > li:nth-child(3)').within(function($node) {
        cy.wrap($node).find('span:nth-child(1).indent');
        cy.wrap($node).find('span:nth-child(2).indent');
        cy.wrap($node).find('span:nth-child(3).glyphicon');
        cy.wrap($node).find('span:nth-child(4).node-icon');
        cy.wrap($node).find('img:nth-child(5)').invoke('attr', 'src').should('eq', 'assets/tree-icons/threadStartpoint-error-odd.gif');
      });
      cy.get('#CloseButton').click();
      cy.get('div.treeview > ul > li').should('have.length', 0);
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', '');
      // The second report, not two reports
      cy.get('#openInProgressNo').type('2');
      cy.get('#openReportInProgressButton').click();
      cy.get('div.treeview > ul > li').should('have.length', 3);
      cy.get('#CloseButton').click();
      cy.get('div.treeview > ul > li').should('have.length', 0);
      cy.contains('Opened report in progress', {timeout: 10000}).should('have.length', 0);
      cy.get('#openInProgressNo').type('{backspace}');
      cy.get('#openInProgressNo').should('have.text', ''),
      // The third report, should not exist
      cy.get('#openInProgressNo').type('3');
      cy.get('#openReportInProgressButton').click();
      cy.get('div.treeview > ul > li').should('have.length', 0);
      cy.contains('Opened report in progress').should('have.length', 0);
    });
  });
});
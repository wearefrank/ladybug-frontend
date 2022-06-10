describe('Test labels', function() {
  afterEach(function() {
    cy.get('button[id="CloseAllButton"]').click();
    cy.clearDebugStore();
  });

  it('Test label null', function() {
    cy.createReportWithLabelNull();
    cy.visit('');
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 4);
    testTreeView('withLabelNull', 'Null String');
  });

  it('Test label empty string', function() {
    cy.createReportWithLabelEmpty();
    cy.visit('');
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 4);
    testTreeView('withLabelEmptyString', 'Empty String');
  });
});

function testTreeView(reportName, labelString) {
  cy.get('.treeview > ul > li:nth-child(1)').within(function($node) {
    cy.wrap($node).contains(reportName);
    cy.wrap($node).find(':nth-child(1)').should('have.class', 'fa-minus');
    cy.wrap($node).find(':nth-child(2)').should('have.class', 'node-icon');
  });
  cy.get('.treeview > ul > li:nth-child(2)').within(function($node) {
    cy.wrap($node).should('have.text', reportName);
    cy.wrap($node).find(':nth-child(1)').should('have.class', 'indent');
    cy.wrap($node).find(':nth-child(2)').should('have.class', 'expand-icon').should('have.class', 'fa-minus');
    cy.wrap($node).find(':nth-child(3)').should('have.class', 'node-icon');
    cy.wrap($node).find(':nth-child(4)').invoke('attr', 'src').should('eq', 'assets/tree-icons/startpoint-even.gif');
  });
  cy.get('.treeview > ul > li:nth-child(3)').within(function($node) {
    cy.wrap($node).should('have.text', labelString);
    cy.wrap($node).find(':nth-child(1)').should('have.class', 'indent');
    cy.wrap($node).find(':nth-child(2)').should('have.class', 'indent');
    cy.wrap($node).find(':nth-child(3)').should('have.class', 'glyphicon');
    cy.wrap($node).find(':nth-child(4)').should('have.class', 'node-icon');
    cy.wrap($node).find(':nth-child(5)').invoke('attr', 'src').should('eq', 'assets/tree-icons/infopoint-odd.gif');
  });
  cy.get('.treeview > ul > li:nth-child(4)').within(function($node) {
    cy.wrap($node).should('have.text', 'endpoint');
    cy.wrap($node).find(':nth-child(1)').should('have.class', 'indent');
    cy.wrap($node).find(':nth-child(2)').should('have.class', 'indent');
    cy.wrap($node).find(':nth-child(3)').should('have.class', 'glyphicon');
    cy.wrap($node).find(':nth-child(4)').should('have.class', 'node-icon');
    cy.wrap($node).find(':nth-child(5)').invoke('attr', 'src').should('eq', 'assets/tree-icons/endpoint-odd.gif');
  });
}
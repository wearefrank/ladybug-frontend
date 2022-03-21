const { getSystemErrorMap } = require("util");

describe('About opened reports', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('');
  });

  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Test deleting a report', function() {
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li:contains(name)').first().selectIfNotSelected();
    cy.get('button#CopyButton').click();
    cy.get('div.treeview > ul > li:contains(otherName)').first().selectIfNotSelected();
    cy.get('button#CopyButton').click();
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
      cy.wrap($reports).find('tr').each(function($reportRow) {
        if($reportRow.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      })
    });
  });
});  
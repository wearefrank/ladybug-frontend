describe('About the Test tab', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('');
  });

  afterEach(() => {
    cy.clearDebugStore();
    cy.get('li#testTab').click();
    cy.get('#SelectAllButton').click();
    cy.get('#DeleteSelectedButton').click();
    cy.get('li#debugTab').click();
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
      cy.wrap($reports).each(function($reportRow) {
        cy.log('Considering next report');
        const reportName = $reportRow.find('td').eq(3).text();
        cy.log('Name of report is: ' + reportName);
        if(reportName.includes('name')) {
          cy.log('Found checkbox of report with name name, checking it');
          cy.wrap($reportRow).find('[type=checkbox]').check();
        };
      });
    });
    cy.get('#DeleteSelectedButton').click();
    cy.get('#testReports').find('tr').should('have.length', 1).within(function($reports) {
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
  });
});
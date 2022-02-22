describe('Report generator', function() {
  afterEach(function() {
    cy.clearDebugStore();
  });

  it('disable and enable', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.createReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#SettingsButton').click();
    cy.get('select[formcontrolname=generatorEnabled]').select("Disabled");
    cy.createOtherReport();
    // If we do not wait here, we do not test properly that no report is created.
    // Without waiting, the test could succeed because we would count the number of reports
    // before refresh.
    cy.wait(5000);
    cy.get('#RefreshButton').click();
    cy.wait(5000);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('select[formcontrolname=generatorDisabled]').select("Enabled");
    cy.createOtherReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
  });
});
describe('Report generator', function() {
  afterEach(function() {
    cy.clearDebugStore();
    cy.get('#SettingsButton').click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('button[title="Save changes"').click();
  });

  it('disable and enable', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.createReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#SettingsButton').click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Disabled').should('have.value', 'Disabled');
    cy.get('button[title="Save changes"').click();
    cy.get('.alert').contains('Settings saved');
    cy.createOtherReport();
    // If we do not wait here, we do not test properly that no report is created.
    // Without waiting, the test could succeed because we would count the number of reports
    // before refresh.
    cy.wait(5000);
    cy.get('#RefreshButton').click();
    cy.wait(5000);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('.alert').should('not.exist');
    cy.get('#SettingsButton').click();
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('button[title="Save changes"').click();
    cy.get('.alert').contains('Settings saved');
    cy.createOtherReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
  });
});
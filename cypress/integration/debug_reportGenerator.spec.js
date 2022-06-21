describe('Report generator', function() {
  afterEach(function() {
    cy.clearDebugStore();
    cy.get('#SettingsButton').should('be.visible').click();
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
    cy.contains('Settings saved', {timeout: 10000});
    cy.createOtherReport();
    // If we do not wait here, we do not test properly that there is no automatic refresh.
    // If Ladybug would refresh automatically, the test would possibly succeed by
    // taking the situation before that imagined refresh.
    cy.wait(5000);
    cy.get('#RefreshButton').click();
    // We wait here, otherwise we can have a false success in the next step. Without
    // the wait, we can succeed if there was one table row before the refresh was
    // processed.
    cy.wait(5000);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('.alert').should('not.exist');
    cy.get('#SettingsButton').click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('button[title="Save changes"').click();
    cy.contains('Settings saved', {timeout: 10000});
    cy.createOtherReport();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
  });
});
describe('Report generator', () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });
  afterEach(() => {
    cy.get('[data-cy-debug=\'openSettings\']').should('be.visible').click();
    cy.get('[role=dialog]').should('be.visible', { timeout: 10000 });
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('[data-cy-settings=\'saveChanges\']').click();
  });

  it('disable and enable', () => {
    cy.initializeApp();
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('not.exist');
    cy.createReport();
    cy.get('[data-cy-debug=\'refresh\']').click();
    cy.wait(100);
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug=\'openSettings\']').click();
    cy.get('[role=dialog]').should('be.visible', { timeout: 10000 });
    cy.get('select[formcontrolname=generatorEnabled]').select('Disabled').should('have.value', 'Disabled');
    cy.get('[data-cy-settings=\'saveChanges\']').click();
    cy.contains('Settings saved', { timeout: 10000 });
    cy.createOtherReport();
    // If we do not wait here, we do not test properly that no report is created.
    // Without waiting, the test could succeed because we would count the number of reports
    // before refresh.
    cy.get('[data-cy-debug=\'refresh\']').click();
    cy.wait(100);
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug=\'openSettings\']').click();
    cy.get('[role=dialog]').should('be.visible', { timeout: 10000 });
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('[data-cy-settings=\'saveChanges\']').click();
    cy.contains('Settings saved', { timeout: 10000 });
    cy.createOtherReport();
    cy.get('[data-cy-debug=\'refresh\']').click();
    cy.wait(100);
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
  });
});

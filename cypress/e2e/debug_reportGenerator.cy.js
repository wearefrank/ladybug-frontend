describe('Report generator', function() {
  beforeEach(() => {
    cy.clearDebugStore();
  })
  afterEach(function() {
    cy.get("[data-cy-debug='openSettings']").should('be.visible').click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('button[title="Save changes"').click();
  });

  it('disable and enable', function() {
    cy.visit('');
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.createReport();
    cy.get("[data-cy-debug='refresh']").click();
    cy.wait(100);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get("[data-cy-debug='openSettings']").click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Disabled').should('have.value', 'Disabled');
    cy.get('button[title="Save changes"').click();
    cy.contains('Settings saved', {timeout: 10000});
    cy.createOtherReport();
    // If we do not wait here, we do not test properly that no report is created.
    // Without waiting, the test could succeed because we would count the number of reports
    // before refresh.
    cy.get("[data-cy-debug='refresh']").click();
    cy.wait(100);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get("[data-cy-debug='openSettings']").click();
    cy.get('[role=dialog]').should('be.visible', {timeout: 10000});
    cy.get('select[formcontrolname=generatorEnabled]').select('Enabled').should('have.value', 'Enabled');
    cy.get('button[title="Save changes"').click();
    cy.contains('Settings saved', {timeout: 10000});
    cy.createOtherReport();
    cy.get("[data-cy-debug='refresh']").click();
    cy.wait(100);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
  });
});

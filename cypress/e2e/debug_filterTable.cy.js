describe('Table size and toggle filter', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  it('Typing in a table size and retyping it', () => {
    // We only assume here that the default is two or more.
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 2);
    cy.get("[data-cy-debug='displayAmount']").type('{selectAll}{del}{enter}');
    cy.get("[data-cy-debug='tableBody']").find('tr').should('not.exist');
    // From now on, we type one character at a time. Cypress can type very rapidly.
    // We do not expect our app to catch up without guards.
    cy.get("[data-cy-debug='displayAmount']").type('{selectAll}1{enter}');
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 1);
    cy.get("[data-cy-debug='displayAmount']").type("{backspace}{enter}");
    cy.get("[data-cy-debug='tableBody']").find('tr').should('not.exist');
    cy.get("[data-cy-debug='displayAmount']").type("{selectAll}2{enter}");
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 2);
    cy.get("[data-cy-debug='displayAmount']").type("{backspace}{enter}");
    cy.get("[data-cy-debug='tableBody']").find('tr').should('not.exist');
    cy.get("[data-cy-debug='displayAmount']").type("{selectAll}9{enter}")
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 2)
  })

  it('After clicking filter button, the filters should appear',  () => {
    cy.get("[data-cy-debug='tableFilterRow']").should('not.exist')
    cy.get("[data-cy-debug='filter']").click()
    cy.get("[data-cy-debug='tableFilterRow']").should('be.visible')

    cy.get("[data-cy-debug='filter']").click()
    cy.get("[data-cy-debug='tableFilterRow']").should('not.exist')
  })

  it('Type in a filter parameter',  () => {
    cy.get("[data-cy-debug='filter']").click()
    cy.get("[data-cy-debug='tableFilter']").eq(3).type("(Simple report){enter}")
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 1)
    cy.get("[data-cy-debug='tableFilter']").eq(3).clear().type("{enter}")
    cy.get("[data-cy-debug='tableBody']").find('tr').should('have.length', 2)
  })
})

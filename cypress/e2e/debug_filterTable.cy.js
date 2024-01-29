describe('Table size and toggle filter', function () {
  beforeEach(() => {
    cy.clearDebugStore();
    Cypress.Screenshot.defaults({
      blackout: ['.foo'],
      capture: 'viewport',
      clip: { x: 0, y: 0, width: 200, height: 200 },
      scale: false,
      disableTimersAndAnimations: true,
      screenshotOnRunFailure: true,
      onBeforeScreenshot () { },
      onAfterScreenshot () { },
    })

    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
    cy.wait(500)
  })

  it('Typing in a table size and retyping it', function () {
    // We only assume here that the default is two or more.
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('#displayAmount').type('{selectAll}{del}{enter}');
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    // From now on, we type one character at a time. Cypress can type very rapidly.
    // We do not expect our app to catch up without guards.
    cy.get('#displayAmount').type('{selectAll}1{enter}');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#displayAmount').type("{backspace}{enter}");
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.get('#displayAmount').type("{selectAll}2{enter}");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('#displayAmount').type("{backspace}{enter}");
    cy.get('.table-responsive tbody').find('tr').should('not.exist');
    cy.get('#displayAmount').type("{selectAll}9{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })

  it('After clicking filter button, the filters should appear', function () {
    cy.get('#filterRow').should('not.exist')
    cy.get("[data-cy-debug='filter']").click()
    cy.get('#filterRow').should('be.visible')

    cy.get("[data-cy-debug='filter']").click()
    cy.get('#filterRow').should('not.exist')
  })

  it('Type in a filter parameter', function () {
    cy.get("[data-cy-debug='filter']").click()
    cy.get('#filterRow #filter').eq(3).type("(Simple report){enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1)
    cy.get('#filterRow #filter').eq(3).clear().type("{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })
})

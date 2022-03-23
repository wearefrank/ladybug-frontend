describe('Table size and toggle filter', function () {
  beforeEach(() => {
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
  })

  afterEach(() => {
    cy.clearDebugStore();
  })

  it('Typing in a table size and retyping it', function () {
    // We only assume here that the default is two or more.
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('#displayAmount').type('{selectAll}{del}');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    // From now on, we type one character at a time. Cypress can type very rapidly.
    // We do not expect our app to catch up without guards.
    cy.get('#displayAmount').type(1);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#displayAmount').type("{backspace}");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.get('#displayAmount').type("2");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('#displayAmount').type("{backspace}");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.get('#displayAmount').type("9")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })

  it('After clicking filter button, the filters should appear', function () {
    cy.get('#filterRow').should('not.exist')
    cy.get('#FilterButton').click()
    cy.get('#filterRow').should('be.visible')

    cy.get('#FilterButton').click()
    cy.get('#filterRow').should('not.exist')
  })

  it('Type in a filter parameter', function () {
    cy.get('#FilterButton').click()
    cy.get('#filterRow #filter').eq(3).type("name{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1)
    cy.get('#filterRow #filter').eq(3).clear().type("{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })
})

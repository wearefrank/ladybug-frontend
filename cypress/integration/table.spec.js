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
    // The default value for the maximum is 10 and there are 2 reports, so expect 2.
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('#displayAmount').type(1);
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#displayAmount').type("{backspace}2");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    // If we would omit typing 1 here, we would test that the length remained 2
    // when the edit field changed from 2 to 10. This would not be a good test, because
    // Cypress would not see when the typing of 10 would have effect.
    cy.get('#displayAmount').type("{backspace}1");
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1);
    cy.get('#displayAmount').type("{backspace}10")
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

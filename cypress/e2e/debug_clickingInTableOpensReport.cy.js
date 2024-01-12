describe('Clicking a report', function () {
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
  })

  it('Selecting report should show a tree', function() {
    // Create a screenshot, because we want to have at least one after running the tests.
    // We can then check whether the screenshots are saved as artifacts by GitHub.
    cy.screenshot();
    // cy.get('#treeButtons').should('not.be.visible')
    cy.get('.table-responsive tbody').find('tr').first().click()
    cy.get('#treeButtons').should('be.visible')
  })

  it('Selecting report should show display', function () {
    cy.screenshot();
    cy.get('#displayButtons').should('not.be.visible')
    cy.get('#editor').should('not.be.visible')
    cy.get('.table-responsive tbody').find('tr').first().click()
    cy.get('#displayButtons').should('be.visible')
    cy.get('#editor').should('be.visible')
  })
})

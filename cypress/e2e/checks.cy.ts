describe('Checks of the test environment', () => {
  it('Show environment', () => {
    cy.log('Environment variable \'selection\' is ' + Cypress.env('selection'))
    cy.screenshot()
  })
})
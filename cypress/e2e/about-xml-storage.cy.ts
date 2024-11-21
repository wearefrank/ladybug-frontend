describe('Compare with and without profile xml.storage', () => {
  beforeEach(() => {
    cy.initializeApp();
    cy.navigateToTestTabAndInterceptApiCall();
  })

  if(Cypress.env('selection') === "xml-storage") {
    it('Report present in src/test/testtool should be shown', () => {
      cy.getTestTableRows().contains('Pre existing report').should('have.length', 1)
    })
  } else {
    it('Report present in src/test/testtool should not be shown', () => {
      cy.getTestTableRows().contains('Pre existing report').should('not.exist')
    })
  }
})
// This test should be run as the first. Other tests
// have to delete all reports from the test tab and
// would remove pre-existing reports.
//
// Furthermore, we need an empty test tab in case
// there are no predefined reports.
//
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
      // We cannot search for 'Pre existing report' within the
      // test rows when there are not table rows at all.
      cy.getTestTableRows().should('not.exist')
    })
  }
})
describe('Clicking a report', function () {
  beforeEach(() => {
    cy.visit('')
  })
  
  it('Selecting report should show a tree', function() {
    cy.get('#treeButtons').should('not.be.visible')
    cy.get('.table-responsive tbody').find('tr').first().click()
    cy.get('#treeButtons').should('be.visible')
  })

  it('Selecting report should show display', function () {
    cy.get('#displayButtons').should('not.exist')
    cy.get('#monacoEditor').should('not.exist')
    cy.get('.table-responsive tbody').find('tr').first().click()
    cy.get('#displayButtons').should('be.visible')
    cy.get('#monacoEditor').should('be.visible')
  })


})

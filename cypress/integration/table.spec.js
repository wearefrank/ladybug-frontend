let URL = "http://localhost:4200"

beforeEach(() => {
  cy.visit(URL)
})

describe('Changing the table size', function () {
  it('Typing in a table size', function () {
    cy.get('#displayAmount').type(5)
    cy.get('.table-responsive tbody').find('tr').should('have.length', 5)
  })

  it('Remove table size', function () {
    cy.get('#displayAmount').clear()
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0)
  })

  it('Retype larger table size', function () {
    cy.get('#displayAmount').type(10)
    cy.get('.table-responsive tbody').find('tr').should('have.length', 10)
  })
})


describe('Toggle filter and filter results', function () {
  it('At first the filters should not be visible', function () {
    cy.get('#filterRow').should('not.exist')
  })

  it('After clicking filter button, the filters should appear', function () {
    cy.get('#FilterButton').click()
    cy.get('#filterRow').should('be.visible')

    cy.get('#FilterButton').click()
    cy.get('#filterRow').should('not.exist')
  })

  it('Type in a filter parameter', function () {
    cy.get('#FilterButton').click()
    cy.get('#filterRow #filter').eq(2).type("testRerun{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })

  it('Empty the filter', function () {
    cy.get('#FilterButton').click()
    cy.get('#filterRow #filter').eq(2).type("testRerun{enter}")
    cy.get('#filterRow #filter').eq(2).clear().type("{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 10)
  })
})

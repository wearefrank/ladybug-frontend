describe('Table size and toggle filter', function () {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
  })

  afterEach(() => {
    cy.clearDebugStore();
  })

  it('Typing in a table size and retyping it', function () {
    cy.get('#displayAmount').type(2)
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
    cy.get('#displayAmount').clear()
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0)
    cy.get('#displayAmount').type(10)
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
    cy.get('#filterRow #filter').eq(2).type("name{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 1)
    cy.get('#filterRow #filter').eq(2).clear().type("{enter}")
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2)
  })
})

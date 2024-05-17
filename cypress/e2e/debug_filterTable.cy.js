describe('Table size and toggle filter', () => {
  beforeEach(() => {
    cy.resetApp();
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Typing in a table size and retyping it', () => {
    // We only assume here that the default is two or more.
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}{del}{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('not.exist');
    // From now on, we type one character at a time. Cypress can type very rapidly.
    // We do not expect our app to catch up without guards.
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}1{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug="displayAmount"]').type('{backspace}{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('not.exist');
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}2{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
    cy.get('[data-cy-debug="displayAmount"]').type('{backspace}{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('not.exist');
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}9{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
  });

  it('After clicking filter button, the filter side drawer should appear', () => {
    cy.get('[data-cy-debug="filter-side-drawer"]').should('not.exist');
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="filter-side-drawer"]').should('be.visible');
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="filter-side-drawer"]').should('not.exist');
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="filter-side-drawer"]').should('be.visible');
    cy.get('[data-cy-debug="close-filter-btn"]').click();
    cy.get('[data-cy-debug="filter-side-drawer"]').should('not.exist');
  });

  it('Type in a filter parameter should limit the records viewed in the record table', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('(Simple report){enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).clear().type('{enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('(Simple report){enter}');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug="clear-filter-btn"').click();
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
  });

  it('After clicking or typing in the filter text field, an autocomplete menu should show that displays the options of the current filter', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="matAutocompleteOption"]').should('be.visible');
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
  });

  it('Selecting an option should update the table and selecting the empty option should reset the text field of the selected filter', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="matAutocompleteOption"]').first().click();
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 1);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="filterClearButton"]').eq(3).click();
    cy.get('[data-cy-debug="tableBody"]').find('tr').should('have.length', 2);
    cy.get('[data-cy-debug="filter"]').click();
  });
});

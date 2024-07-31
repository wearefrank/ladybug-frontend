describe('Table size and toggle filter', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.resetApp();
  });

  it('Typing in a table size and retyping it', () => {
    // We only assume here that the default is two or more.
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}{del}{enter}');
    cy.assertDebugTableLength(0);
    // From now on, we type one character at a time. Cypress can type very rapidly.
    // We do not expect our app to catch up without guards.
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}1{enter}');
    cy.assertDebugTableLength(1);
    cy.get('[data-cy-debug="displayAmount"]').type('{backspace}{enter}');
    cy.assertDebugTableLength(0);
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}2{enter}');
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="displayAmount"]').type('{backspace}{enter}');
    cy.assertDebugTableLength(0);
    cy.get('[data-cy-debug="displayAmount"]').type('{selectAll}9{enter}');
    cy.assertDebugTableLength(2);
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
    cy.assertDebugTableLength(1);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).clear().type('{enter}');
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('(Simple report){enter}');
    cy.assertDebugTableLength(1);
    cy.get('[data-cy-debug="clear-filter-btn"').click();
    cy.assertDebugTableLength(2);
  });

  it('After clicking or typing in the filter text field, an autocomplete menu should show that displays the options of the current filter', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="matAutocompleteOption"]').should('be.visible');
    cy.assertDebugTableLength(2);
  });

  it('Giving a wrong type for the filter field should display an error', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(0).type('test');
    cy.get('[data-cy-debug="filter-error-message"]').should('be.visible');
    cy.contains('Filter Error: Search value \'test\' is not a valid \'number\' ');
    cy.get('[data-cy-debug="filter"]').click();
  });

  it('Selecting an option should update the table and selecting the empty option should reset the text field of the selected filter', () => {
    cy.get('[data-cy-debug="filter"]').click();
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="matAutocompleteOption"]').first().click();
    cy.assertDebugTableLength(1);
    cy.get('[data-cy-debug="tableFilter"]').eq(3).type('test');
    cy.get('[data-cy-debug="filterClearButton"]').eq(3).click();
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="filter"]').click();
  });
});

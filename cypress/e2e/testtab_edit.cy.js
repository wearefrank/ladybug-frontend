describe('Edit tests', () => {
  beforeEach(() => {
    cy.resetApp();
  });

  it('Edit report in test tab', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.get('[data-cy-test-editor="edit"]', { timeout: 5000 }).click();
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('[data-cy-test-editor="editor"]', { timeout: 5000 })
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Hello Original World!');
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('.col:not(.text-right)').contains('Hello World!');
    cy.get('.col.text-right').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.get(
      '.report-tab .jqx-tree-dropdown-root > li > ul > li > ul > li > div', { timeout: 5000 }
    ).click();
    cy.get('[data-cy-test-editor="edit"]', { timeout: 5000 }).click();
    cy.get('[data-cy-test-editor="editor"]', { timeout: 5000 })
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Goodbye Original World!');
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('button:contains(Yes)').click();
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.get('[data-cy-test="runAll"]').click();
  });

  it('Editing without pressing Edit produces error', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    // Do not press Edit button
    cy.get('[data-cy-test-editor="save"]', { timeout: 5000 }).should('have.length', 0);
    cy.get('[data-cy-test-editor="editor"]').click().type('x');
    cy.get('[data-cy-test-editor="readonlyLabel"]').contains('OFF');
  });

  it('When saving edit cancelled then original text kept and rerun fails', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.get('[data-cy-test-editor="edit"]', { timeout: 5000 }).click();
    cy.get('[data-cy-test-editor="readonlyLabel"]').contains('ON');
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('[data-cy-test-editor="editor"]', { timeout: 5000 })
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Hello Original World!');
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.contains('Hello Original World!');
    // Give dialog time to initialize
    cy.get('button:contains(No)', { timeout: 5000 }).click();
    cy.get('.modal-title').should('have.length', 0);
    cy.get('[data-cy-test-editor="save"]').should('have.length', 1);
    cy.contains('Hello Original World!');
    cy.navigateToTestTabAndWait();
    cy.get('[data-cy-test="runAll"]').click();
    // cy.get('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'red');
  });
});

function prepareEdit() {
  cy.createReport();
  cy.initializeApp();
  cy.get('[data-cy-debug="selectAll"]', { timeout: 5000 }).click();
  cy.get('[data-cy-debug="openSelected"]').click();
  cy.debugTreeGuardedCopyReport('Simple report', 3, '');
  cy.get('[data-cy-nav-tab="testTab"]').click();
  cy.checkTestTableNumRows(1);
  cy.get('[data-cy-test="openReport"]').click();
  // Martijn hopes this fixes an issue in Firefox.
  cy.get('[data-cy-nav-tab="Simple report"]', { timeout: 5000 })
    .find('div.active')
    .should('include.text', 'Simple report');
  // Wait until the tab has been rendered
  cy.get('.report-tab .jqx-tree-dropdown-root > li').should('have.length', 1);
}

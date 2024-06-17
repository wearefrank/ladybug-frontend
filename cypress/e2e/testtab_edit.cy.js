describe('Edit tests', () => {
  before(() => cy.resetApp());

  afterEach(() => cy.resetApp());

  it('Edit report in test tab', () => {
    prepareEdit();
    cy.clickFirstChildInFileTree();
    cy.get('[data-cy-test-editor="edit"]').click();
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('[data-cy-test-editor="editor"]')
      .click()
      .focused()
      .type('{selectAll}Hello Original World!')
    cy.wait(100)
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('[data-cy-changes-form-before="message"]').contains('Hello World!');
    cy.get('[data-cy-changes-form-after="message"]').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.clickFirstChildInFileTree();
    cy.get('[data-cy-test-editor="edit"]').click();
    cy.get('[data-cy-test-editor="editor"]')
      .click()
      .focused()
      .type('{selectAll}Goodbye Original World!');
    cy.wait(100)
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('button:contains(Yes)').click();
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.get('[data-cy-test="runAll"]').click();
  });

  it('Editing without pressing Edit produces error', () => {
    prepareEdit();
    cy.clickFirstChildInFileTree();
    // Do not press Edit button
    cy.get('[data-cy-test-editor="save"]').should('have.length', 0);
    cy.get('[data-cy-test-editor="editor"]').click().type('x');
    cy.get('[data-cy-test-editor="readonlyLabel"]').contains('OFF');
  });

  it('When saving edit cancelled then original text kept and rerun fails', () => {
    prepareEdit();
    cy.clickFirstChildInFileTree();
    cy.get('[data-cy-test-editor="edit"]').click();
    cy.get('[data-cy-test-editor="readonlyLabel"]').contains('ON');
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('[data-cy-test-editor="editor"]')
      .click()
      .focused()
      .type('{selectAll}Hello Original World!')
    cy.wait(100)
    cy.get('[data-cy-test-editor="save"]').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.contains('Hello Original World!');
    // Give dialog time to initialize
    cy.get('button:contains(No)').click();
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
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="openSelected"]').click();
  cy.debugTreeGuardedCopyReport('Simple report', 3, '');
  cy.get('[data-cy-nav-tab="testTab"]').click();
  cy.checkTestTableNumRows(1);
  cy.get('[data-cy-test="openReport"]').click();
  // Martijn hopes this fixes an issue in Firefox.
  cy.get('[data-cy-nav-tab="Simple report"]')
    .find('div.active')
    .should('include.text', 'Simple report');
  // Wait until the tab has been rendered
  cy.checkFileTreeLength(1);
}

describe('Edit tests', () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  it('Edit report in test tab', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    cy.get('[data-cy-test-editor=\'edit\']').click();
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get("[data-cy-test-editor='editor']")
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Hello Original World!');
    cy.get('[data-cy-test-editor=\'save\']').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('.col:not(.text-right)').contains('Hello World!');
    cy.get('.col.text-right').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.wait(1000);
    cy.get(
      '.report-tab .jqx-tree-dropdown-root > li > ul > li > ul > li > div',
    ).click();
    cy.wait(1000);
    cy.get('[data-cy-test-editor=\'edit\']').click();
    cy.wait(1000);
    cy.get("[data-cy-test-editor='editor']")
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Goodbye Original World!');
    cy.get('[data-cy-test-editor=\'save\']').click();
    cy.get('button:contains(Yes)').click();
    cy.get('[data-cy-nav-tab=\'testTab\']').click();
    cy.get('[data-cy-test=\'runAll\']').click();
    cleanup()
  });

  it('Editing without pressing Edit produces error', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    // Do not press Edit button
    cy.get("[data-cy-test-editor='save']").should("have.length", 0);
    cy.get("[data-cy-test-editor='editor']").click().type("x");
    cy.get("[data-cy-test-editor='readonlyLabel']").contains("OFF");
    cy.get(".message").should("have.length", 0);
    cleanup()
  });

  it('When saving edit cancelled then original text kept and rerun fails', () => {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    cy.get("[data-cy-test-editor='edit']").click();
    cy.get("[data-cy-test-editor='readonlyLabel']").contains("ON");
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get("[data-cy-test-editor='editor']")
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Hello Original World!');
    cy.get('[data-cy-test-editor=\'save\']').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.contains('Hello Original World!');
    // Give dialog time to initialize
    cy.wait(1000);
    cy.get('button:contains(No)').click();
    cy.get('.modal-title').should('have.length', 0);
    cy.get('[data-cy-test-editor=\'save\']').should('have.length', 1);
    cy.contains('Hello Original World!');
    cy.navigateToTestTabAndWait();
    cy.get('[data-cy-test=\'runAll\']').click();
    // cy.get('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'red');
    cy.deleteAllTestReports();
  });
});

function prepareEdit() {
  cy.createReport();
  cy.initializeApp();
  cy.wait(100);
  cy.get("[data-cy-debug='selectAll']").click();
  cy.get("[data-cy-debug='openSelected']").click();
  cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should("have.length", 1);
  cy.get("[data-cy-debug-editor='copy']").click();
  cy.get("[data-cy-nav-tab='testTab']").click();
  cy.checkTestTableNumRows(1);
  cy.get("[data-cy-test='openReport']").click();
  // Martijn hopes this fixes an issue in Firefox.
  cy.wait(1000);
  cy.get('[data-cy-nav-tab=\'Simple report\']')
    .find('a.active')
    .should('include.text', 'Simple report');
  // Wait until the tab has been rendered
  cy.get('.report-tab .jqx-tree-dropdown-root > li').should('have.length', 1);
}


function cleanup() {
  cy.clearDebugStore();
  cy.get("[data-cy-nav-tab='debugTab'] a").click();
  cy.get("[data-cy-nav-tab='debugTab'] a:eq(0)").should("have.class", "active");
  // Wait for debug tab to be rendered
  cy.wait(1000);
  cy.get("[data-cy-debug-tree='closeAll']").click();
  cy.get("[data-cy-debug-tree='root'] .jqx-tree-dropdown-root > li").should("have.length", 0);
  cy.get("[data-cy-nav-tab='testTab']").click();
  // Give UI time to build up the test tab.
  cy.wait(1000);
  cy.get("[data-cy-test='selectAll']").click();
  cy.get("[data-cy-test='deleteSelected']").click();
  cy.get("[data-cy-delete-modal='confirm']").click();
  cy.checkTestTableNumRows(0);
  cy.get("[data-cy-nav-tab='debugTab']").click();
  cy.deleteAllTestReports();
}

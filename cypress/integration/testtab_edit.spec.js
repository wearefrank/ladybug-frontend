import chaiColors from 'chai-colors'
chai.use(chaiColors)

describe('Edit tests', function() {
  beforeEach(() => {
    cy.clearDebugStore();
  })

  afterEach(function() {
    cy.clearDebugStore();
    cy.get('li#debugTab a').click();
    cy.get('li#debugTab a:eq(0)').should('have.class', 'active');
    // Wait for debug tab to be rendered
    cy.wait(1000);
    cy.get('button[id="CloseAllButton"]').click();
    cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 0);
    cy.get('li#testTab').click();
    // Give UI time to build up the test tab.
    cy.wait(1000);
    cy.get('#SelectAllButton').click();
    cy.get('#DeleteSelectedButton').click();
    cy.get('#confirmDeletion').click();
    cy.get('#testReports tr', {timeout: 10000}).should('have.length', 0);
    cy.get('li#debugTab').click();
  });

  it('Edit report in test tab', function() {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('.report-tab #editor').click().focused().type('{ctrl}a').type('Hello Original World!');
    cy.get('#SaveButton').click()
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('.col:not(.text-right)').contains('Hello World!');
    cy.get('.col.text-right').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.wait(1000);
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > ul > li > div').click()
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.wait(1000);
    cy.get('.report-tab #editor').click().focused().type('{ctrl}a').type('Goodbye Original World!');
    cy.get('#SaveButton').click()
    cy.get('button:contains(Yes)').click();
    cy.get('li#testTab').click();
    cy.get('#RunreportButton').click();
    // cy.get('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'green');
  });

  it('Editing without pressing Edit produces error', function() {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    // Do not press Edit button
    cy.get('#SaveButton').should('have.length', 0);
    cy.get('.report-tab #editor').click().type('x');
    cy.get('#readyOnlyLabel').contains('OFF');
    cy.get('.message').should('have.length', 0);
  });

  it('When saving edit cancelled then original text kept and rerun fails', function() {
    prepareEdit();
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.get('#readyOnlyLabel').contains('ON');
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('.report-tab #editor').click().focused().type('{ctrl}a').type('Hello Original World!');
    cy.get('#SaveButton').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.contains('Hello Original World!');
    // Give dialog time to initialize
    cy.wait(1000);
    cy.get('button:contains(No)').click();
    cy.get('.modal-title').should('have.length', 0);
    cy.get('#SaveButton').should('have.length', 1);
    cy.contains('Hello Original World!');
    cy.get('li#testTab').click();
    cy.get('#RunreportButton').click();
    // cy.get('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'red');
  });
});

function prepareEdit() {
  cy.createReport();
  cy.visit('');
  cy.wait(100);
  cy.get('button[id="SelectAllReportsButton"]').click();
    cy.get('button[id="OpenSelectedReportsButton"]').click();
  cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 1);
  cy.get('button#CopyButton').click();
  cy.get('li#testTab').click();
  cy.get('#testReports tr').should('have.length', 1);
  cy.get('#OpenreportButton').click();
  // Martijn hopes this fixes an issue in Firefox. The test
  // should see that the fourth tab has caption "Simple report".
  cy.wait(1000);
  cy.get('ul.nav-tabs li:nth-child(3)').find('a.active').should('include.text', 'Simple report');
  // Wait until the tab has been rendered
  cy.get('.report-tab .jqx-tree-dropdown-root > li').should('have.length', 1);
}

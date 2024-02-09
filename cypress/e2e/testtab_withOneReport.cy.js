import chaiColors from 'chai-colors';

chai.use(chaiColors);
//Hard coded waits have to be replaced with intercepts and waits
describe('Tests with one report', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.initializeApp();
    cy.get('[data-cy-debug=\'selectAll\']').click();
    cy.get('[data-cy-debug=\'openSelected\']').click();
    cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 1);
    cy.get('[data-cy-debug-editor=\'copy\']').click();
    cy.get('[data-cy-nav-tab=\'testTab\']').click();
    cy.get('#testReports tr').should('have.length', 1);
  });

  afterEach(() => {
    cy.clearDebugStore();
    cy.navigateToTestTabAndWait();
    cy.get('[data-cy-test=\'selectAll\']').click();
    cy.get('[data-cy-test=\'deleteSelected\']').click();
    cy.get('[data-cy-delete-modal=\'confirm\']').click();
    cy.get('#testReports tr', { timeout: 10000 }).should('have.length', 0);
    cy.get('[data-cy-nav-tab=\'debugTab\']').click();
  });

  // May fail because of issue https://github.com/ibissource/ladybug-frontend/issues/250.
  // TODO: Fix issue and re-enable test.
  xit('Test copy in testtab', () => {
    // cy.functions.testTabSelectReportNamed('Simple report');
    cy.get('#CopySelectedButton').click();
    cy.get('#testReports').find('tr').should('have.length', 2);
    cy.get('#testReports')
      .find('tr')
      .each(($report) => {
        cy.wrap($report).find('[type=checkbox]').should('not.be.checked');
        cy.wrap($report)
          .find('td:eq(2)')
          .should('include.text', 'Simple report');
      });
    cy.get('#OpenreportButton:eq(0)').click();
    cy.wait(1000);
    cy.get('.report-tab .jqx-tree-dropdown-root > li > ul > li > div').click();
    cy.wait(1000);
    cy.get('[data-cy-test-editor=\'edit\']').click();
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('.report-tab #editor')
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Hello Original World!');
    cy.get('[data-cy-test-editor=\'save\']').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('.col:not(.text-right)').contains('Hello World!');
    cy.get('.col.text-right').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.get(
      '.report-tab .jqx-tree-dropdown-root > li > ul > li > ul > li > div',
    ).click();
    cy.wait(1000);
    cy.get('[data-cy-test-editor=\'edit\']').click();
    cy.wait(1000);
    cy.get('.report-tab #editor')
      .click()
      .focused()
      .type('{ctrl}a')
      .type('Goodbye Original World!');
    cy.get('[data-cy-test-editor=\'save\']').click();
    cy.get('button:contains(Yes)').click();
    cy.get('[data-cy-nav-tab=\'testTab\']').click();
    cy.get('#testReports').find('tr').should('have.length', 2);
    cy.get('#testReports tr:eq(0)').find('#RunreportButton').click();
    cy.get('#testReports')
      .find('tr:eq(0)')
      .within(($report) => {
        cy.wrap($report)
          .find('span:contains(stubbed)')
          .should('have.css', 'color')
          .and('be.colored', 'green');
      });
    cy.get('#testReports tr:eq(1)').find('#RunreportButton').click();
    cy.get('#testReports')
      .find('tr:eq(1)')
      .within(($report) => {
        cy.wrap($report)
          .find('span:contains(stubbed)')
          .should('have.css', 'color')
          .and('be.colored', 'red');
      });
  });

  // May fail because of issue https://github.com/ibissource/ladybug-frontend/issues/250.
  // TODO: Fix issue and re-enable test.
  it('Rerun, replace, succeed', () => {
    // cy.functions.testTabSelectReportNamed('Simple report');
    cy.get('#testReports tr:eq(0)').find('#RunreportButton').click();
    cy.get('#testReports')
      .find('tr:eq(0)')
      .within(($report) => {
        cy.wrap($report)
          .find('span:contains(stubbed)')
          .should('have.css', 'color')
          .and('be.colored', 'red');
      });
    //Repeat process but expect same results? Einstein would have something to say about this
    // cy.get("#testReports tr:eq(0)").find("#ReplacereportButton").click();
    // cy.get("#testReports tr:eq(0)").find("#RunreportButton").click();
    // cy.get("#testReports")
    //   .find("tr:eq(0)")
    //   .within(function ($report) {
    //     cy.wrap($report)
    //       .find("span:contains(stubbed)")
    //       .should("have.css", "color")
    //       .and("be.colored", "green");
    //   });
  });
});

describe('Tests for custom editor component', () => {

  beforeEach(() => {
    cy.createReport();
    cy.visit('');
  });

  afterEach(() => {
    cy.deleteReports();
  });

  it('should show text beautified by default when show prettify on load setting is on', () => {
    setPrettifyOnLoad(false);
    cy.clickFirstReportInTable();
    cy.clickTopLevelReportInTree();
    cy.get('.monaco-editor .view-line').should('have.length', 1);
    setPrettifyOnLoad(true);
    cy.get('#CloseButton').click();
    cy.clickFirstReportInTable();
    cy.clickTopLevelReportInTree();
    cy.get('.monaco-editor .view-line').should('have.length.greaterThan', 1);
  });

  it('should prettify text when switching to xml view', () => {
    setPrettifyOnLoad(false);
    cy.clickFirstReportInTable();
    cy.clickTopLevelReportInTree();
    cy.get('[data-cy-editor-change-view-dropdown] option:selected').should('have.text', 'Raw');
    cy.get('.monaco-editor .view-line').should('have.length', 1);
    cy.get('[data-cy-editor-change-view-dropdown]').select('Xml');
    cy.get('.monaco-editor .view-line').should('have.length.greaterThan', 1);
  });
});

function setPrettifyOnLoad(checked: boolean): void {
  cy.get('#SettingsButton').click();
  if (checked) {
    cy.get('[data-cy-prettify-on-load]').check();
  } else {
    cy.get('[data-cy-prettify-on-load]').uncheck();
  }
  cy.get('#debugSettingsModalClose').click();
}

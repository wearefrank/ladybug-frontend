import { showSkipped } from "cypress/support/commands";

describe('Tests for keeping state in tabs when switching tabs', () => {
  if(Cypress.env('selection') !== "default") {
    showSkipped()
    return
  }

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.clearDebugStore()
    cy.clearTestReports()
  });

  it('should reopen the last opened report in debug tab when switching tabs', () => {
    const metadataCellIdentifier = '[data-cy-metadata="storageId"]'
    cy.clickRowInTable(0);
    cy.clickRootNodeInFileTree();
    cy.get('[data-cy-open-metadata-table]').click()
    cy.get(metadataCellIdentifier).then((element) => {
      const openedReportUid = element.text()
      cy.navigateToTestTab();
      cy.navigateToDebugTab();
      cy.get(metadataCellIdentifier).should('contain.text', openedReportUid);
    })
  });

  it('should keep the same reports selected in debug table', () => {
    cy.selectRowInDebugTable(0)
    cy.navigateToTestTab();
    cy.navigateToDebugTab()
    cy.get('[data-cy-debug="selectOne"]').eq(0).should('be.checked')
  });

  it('should keep the same reports selected in test table', () => {
    copyToTestTab(0)
    copyToTestTab(1)
    cy.intercept({
      method: 'GET',
      hostname: 'localhost',
      url: /\/metadata\/Test\/*?/g,
    }).as('test-reports');
    cy.navigateToTestTab()
    cy.wait('@test-reports').then((result) => {
      cy.selectAllRowsInTestTable();
      cy.get('[data-cy-test="selectOne"]').eq(1).click()
      cy.navigateToDebugTab()
      cy.navigateToTestTab();
      cy.get('[data-cy-test="selectOne"]').eq(0).should('not.be.checked')
      cy.get('[data-cy-test="selectOne"]').eq(1).should('be.checked')
    })
  });

});

function copyToTestTab(index: number) {
  const alias = `copy-report-${index}`
  cy.intercept({
    method: 'PUT',
    hostname: 'localhost',
    url: /\/report\/store\/*?/g,
  }).as(alias);
  cy.clickRowInTable(index)
  cy.get('[data-cy-debug-editor="copy"]').click()
  cy.wait(`@${alias}`)
}

describe('Tests for keeping state in tabs when switching tabs', () => {

  beforeEach(() => {
    cy.createReport();
    cy.initializeApp();
  });

  afterEach(() => cy.clearDebugStore());

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
});

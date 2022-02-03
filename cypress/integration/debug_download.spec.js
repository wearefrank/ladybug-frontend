describe('Debug tab download', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
  });

  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Download all opened reports', function() {
    cy.get('button[id="OpenAllButton"]').click();

  });
});
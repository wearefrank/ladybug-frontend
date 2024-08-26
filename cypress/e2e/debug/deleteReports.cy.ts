describe('About deleting reports', () => {
  beforeEach(() => {
    cy.resetApp()
  });

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Should delete a single report with the deleteSelected button', () => {
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="selectOne"]').eq(0).click();
    cy.get('[data-cy-debug="deleteSelected"]').click();
    cy.getDebugTableRows().first().contains('Another simple report');
  });

  it ('Should delete all reports with the deleteAll button', () => {
    cy.assertDebugTableLength(2);
    cy.get('[data-cy-debug="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.assertDebugTableLength(0);
  });

  it ('Should not open the delete modal when there are no reports', () => {
    cy.get('[data-cy-debug="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').should('exist').click();
    cy.get('[data-cy-debug="deleteAll"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').should('not.exist');
  });
});

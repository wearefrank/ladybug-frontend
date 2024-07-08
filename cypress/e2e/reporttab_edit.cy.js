describe('Edit tests', () => {
  before(() => cy.resetApp());

  afterEach(() => cy.resetApp());

  xit('Should allow editing report in report tab', () => {
    prepareEdit();
    cy.clickFirstChildInFileTree();
    cy.get('[data-cy-report="toggleEdit"]').click();
    cy.wait(1500);
    cy.get('[data-cy-report="editor"]').wait(1000)
      .click().wait(1000)
      .focused().wait(1000)
      .type('Hello Original World!');
    cy.wait(100);
    cy.get('[data-cy-report="save"]').click();
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('[data-cy-changes-form-before="message"]').contains('Hello World!');
    cy.get('[data-cy-changes-form-after="message"]').contains('Hello Original World!');
    cy.get('[data-cy-difference-modal="confirm"]').click();
    cy.clickFirstChildInFileTree();
    cy.get('[data-cy-report="toggleEdit"]').click();
    cy.wait(1500);
    cy.get('[data-cy-report="editor"]')
      .click()
      .focused()
      .type('{selectAll}Goodbye Original World!');
    cy.wait(100);
    cy.get('[data-cy-report="save"]').click();
    cy.get('[data-cy-difference-modal="confirm"]').click();
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.get('[data-cy-test="runAll"]').click();
  });

  xit('Should disable rerun when in edit mode', () => {
    prepareEdit();
    cy.get('[data-cy-report="rerun"]').should('not.have.attr', 'disabled');
    cy.get('[data-cy-report="toggleEdit"]').click();
    cy.get('[data-cy-report="rerun"]').should('have.attr', 'disabled');
  });

  xit('Should show save and trash buttons when in edit mode', () => {
    prepareEdit();
    cy.get('[data-cy-report="discard"]').should('not.exist');
    cy.get('[data-cy-report="save"]').should('not.exist');
    cy.get('[data-cy-report="toggleEdit"]').click();
    cy.get('[data-cy-report="discard"]').should('exist');
    cy.get('[data-cy-report="save"]').should('exist');
  });
});

function prepareEdit() {
  cy.createReport();
  cy.initializeApp();
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="openReportTab"]').click();
  cy.get('[data-cy-nav-tab="Simple report"]')
    .find('div.active')
    .should('include.text', 'Simple report');
  cy.checkFileTreeLength(1);
}

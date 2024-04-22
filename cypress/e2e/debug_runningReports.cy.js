describe('Test running reports', () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  it('If no running reports then number of running reports is zero', () => {
    cy.initializeApp();
    cy.contains('Reports in progress: 0');
  });
});

describe('With running reports', () => {
  beforeEach(() => {
    cy.createRunningReport();
    cy.createRunningReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.removeReportInProgress();
    cy.removeReportInProgress();
  });

  it('Open running reports', () => {
    cy.get('[data-cy-debug-in-progress-counter]').should('contain.text', 'Reports in progress: 2');
    cy.get('[data-cy-debug="refresh"]').click();
    cy.wait(100);
    cy.checkTableNumRows(0);
    cy.checkFileTreeLength(0);
    cy.get('[data-cy-debug="openInProgressNo"]').type('{backspace}1');
    cy.get('[data-cy-debug="openInProgress"]').click();
    cy.get('.toast-body').should('contain.text', 'Opened report in progress');
    cy.checkFileTreeLength(1);
    cy.get('[data-cy-debug-tree="root"] app-tree-item .item-name').eq(0).should('contain.text', 'Waiting for thread to start');

  });
});

describe('Test Reports in progress warning', () => {
  beforeEach(() => {
    cy.createRunningReport();
    cy.initializeApp();
  });

  afterEach(() => {
    cy.removeReportInProgress();
    cy.request(
      Cypress.env('backendServer') + '/index.jsp?setReportInProgressThreshold=300000',
    );
  });

  it('If threshold time has been met then show warning', () => {
    cy.request(
      Cypress.env('backendServer') + '/index.jsp?setReportInProgressThreshold=1',
    );
    cy.get('[data-cy-debug="refresh"]').click();
    cy.contains(`[One or more reports are in progress for more than ${1 / 1000 / 60} minutes]`);
  });
});


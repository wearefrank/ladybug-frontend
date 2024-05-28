const path = require('path');

describe('Debug file upload', () => {
  before(() => cy.resetApp());

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  afterEach(() => cy.resetApp());

  it('Upload a file to debug', () => {
    cy.fixture('testRerun.ttr', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('[data-cy-debug="upload"]').attachFile({
          fileContent,
          fileName: 'testRerun.ttr',
        });
      });
    cy.get('[data-cy-report="jqxTree"]').find('li').should('have.length', 3);
  });
});

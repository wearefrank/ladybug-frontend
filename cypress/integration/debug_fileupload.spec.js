const path = require('path');

describe('Debug file upload', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
  });

  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Upload a file to debug', function () {
    cy.fixture('testRerun.ttr', 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input#uploadFileTable').attachFile({
          fileContent,
          fileName: 'testRerun.ttr',
        });
      });

    cy.get('.jqx-tree-dropdown-root > li').should('have.length', 1);
  })
});

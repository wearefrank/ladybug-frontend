import { showSkipped } from "cypress/support/commands";

describe('Debug file upload', () => {
  if(Cypress.env('selection') === "default") {
    showSkipped()
    return
  }

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
      .then((fileContent) => {
        cy.get('[data-cy-debug="upload"]').find('input').attachFile({
          fileContent,
          fileName: 'testRerun.ttr',
        });
      });
    cy.checkFileTreeLength(1);
  });
});

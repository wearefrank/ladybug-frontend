describe('Debug file upload', () => {
  beforeEach(() => {
    cy.resetApp();
  });

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

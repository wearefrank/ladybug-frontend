const path = require('path');

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
    const downloadsFolder = Cypress.config('downloadsFolder')
    cy.task('downloads', downloadsFolder).then(filesBefore => {
      cy.get('#dropdownDownloadTable').click();
      cy.get('button:contains("XML & Binary")[class="dropdown-item"]').click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then(filesAfter => {
        const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
        expect(newFile).to.contain('Ladybug Debug');
        expect(newFile).to.contain('2 reports');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
        .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
          cy.log(`Number of read bytes: ${buffer.length}`);
          cy.get('div.treeview > ul > li').should('have.length', 0);
          cy.get('input#uploadFileTable').attachFile({
            fileContent: Cypress.Blob.base64StringToBlob(buffer),
            fileName: cy.functions.downloadPath(newFile),
            mimeType: 'application/zip'
          });
          // cy.get('button#UploadButton').click();
          cy.get('div.treeview > ul > li').should('have.length', 2);
        });
      });
    });
  });
});
const path = require('path');

describe('Debug tab download', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
  });

  afterEach(() => {
    cy.clearDebugStore();
    // We have to delete the downloads. Leaving the files and checking for a new file
    // is not sufficient. If we would do that, a new download within the same minute
    // would not be noticed. The name of the downloaded file contains a file name
    // with hours and minutes.
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('deleteDownloads', {downloadsPath: downloadsFolder, fileSep: Cypress.env('FILESEP')});
  });

  it('Download reports from table', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
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
        });
        // Wait for download to complete. Sometimes after the previous step
        // not all bytes are there.
        cy.wait(5000);
        cy.clearDebugStore();
        cy.get('#RefreshButton').click();
        // cy.get('.table-responsive tbody').should('have.length', 0);
        cy.get('div.treeview > ul > li').should('have.length', 0);
        cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
          cy.get('input#uploadFileTable').attachFile({
            fileContent,
            fileName: 'testUploaded.ttr',
          });
        });
        // cy.get('.table-responsive tbody').should('have.length', 0);
        cy.get('div.treeview > ul > li').should('have.length', 6);
      });
    });
  });

  it('Download all open reports', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(name)').should('have.length', 3)
    cy.get('div.treeview > ul > li:contains(otherName)').should('have.length', 3);
    cy.clearDebugStore();
    cy.get('#RefreshButton').click();
    cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
    cy.task('downloads', downloadsFolder).should('have.length.at.least', 0).then(filesBefore => {
      cy.get('#dropdownDownloadTree').click();
      cy.get('#treeButtons button:contains("XML & Binary")[class="dropdown-item"]').click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then(filesAfter => {
        const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
        expect(newFile).to.contain('Ladybug Debug');
        expect(newFile).to.contain('2 reports');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
        .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
          cy.log(`Number of read bytes: ${buffer.length}`);
        });
      });
    });
  });
});
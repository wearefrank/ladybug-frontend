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
    //
    // We cannot do this by setting Cypress setting "trashAssetsBeforeRuns" to "true".
    // That would also delete downloads/.gitignore, which is not what we want.
    // The 'deleteDownloads' task skips .gitignore.
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('deleteDownloads', {downloadsPath: downloadsFolder, fileSep: Cypress.env('FILESEP')});
  });

  it('Download and upload table', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('downloads', downloadsFolder).then(filesBefore => {
      cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
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
        cy.clearDebugStore();
        cy.get('#RefreshButton').click();
        cy.get('.table-responsive tbody').find('tr').should('have.length', 0);
        cy.get('div.treeview > ul > li').should('have.length', 0);
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
        .then((rawContent) => {
          console.log(`Have content of uploaded file, length ${rawContent.length}`);
          return Cypress.Blob.binaryStringToBlob(rawContent);
        })
        .then(fileContent => {
          console.log(`Have transformed content length ${fileContent.length}`);
          cy.get('input#uploadFileTable').attachFile({
            fileContent,
            fileName: newFile
          });
        });
        cy.get('div.treeview > ul > li').should('have.length', 0);
        cy.get('div.treeview > ul > li').should('have.length', 6);
      });
    });
  });

  it('Download all open reports', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(Simple report)').should('have.length', 3)
    cy.get('div.treeview > ul > li:contains(Another simple report)').should('have.length', 3);
    // Debug store should not be cleared, because the report being downloaded
    // is requested here from the backend. The backend should still have the
    // report to have a valid test.
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
        cy.get('button[id="CloseAllButton"]').click();
        cy.get('div.treeview > ul > li').should('have.length', 0);
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
        .then(Cypress.Blob.binaryStringToBlob)
        .then(fileContent => {
          cy.get('input#uploadFileTable').attachFile({
            fileContent,
            fileName: newFile
          });
        });
      });
    });
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(Simple report)').should('have.length', 3)
    cy.get('div.treeview > ul > li:contains(Another simple report)').should('have.length', 3);
  });

  it('Download displayed report, from root node', function() {
    testDownloadFromNode(0);
  });

  it('Download displayed report, from start node', function() {
    testDownloadFromNode(1);
  });

  it('Download displayed report, from end node', function() {
    testDownloadFromNode(2);
  });
});

function testDownloadFromNode(nodeNum) {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.get('.table-responsive tbody').find('tr').should('have.length', 2);
  cy.get('button[id="OpenAllButton"]').click();
  cy.get('div.treeview > ul > li').should('have.length', 6);
  cy.get('div.treeview > ul > li:contains(Simple report)').should('have.length', 3)
  cy.get('div.treeview > ul > li:contains(Another simple report)').should('have.length', 3);
  // Debug store should not be cleared, because the report being downloaded
  // is requested here from the backend. The backend should still have the
  // report to have a valid test.
  //
  // We can not click the node to select it because it is selected already.
  // If we click, we unselect it and then no node is selected anymore.
  cy.get(`div.treeview > ul > li:contains(Simple report):not(:contains(other)):eq(${nodeNum})`).selectIfNotSelected();
  cy.task('downloads', downloadsFolder).should('have.length.at.least', 0).then(filesBefore => {
    cy.get('#dropdownDownloadDisplay').click();
    cy.get('#displayButtons button:contains("Binary"):not(:contains("XML"))[class="dropdown-item"]').click();
    cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
    cy.task('downloads', downloadsFolder).then(filesAfter => {
      const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
      expect(newFile).to.contain('Simple report.ttr');
      expect(newFile).not.to.contain('other');
      cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
      .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
        cy.log(`Number of read bytes: ${buffer.length}`);
      });
      cy.get('button[id="CloseAllButton"]').click();
      cy.get('div.treeview > ul > li').should('have.length', 0);
      cy.readFile(cy.functions.downloadPath(newFile), 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then(fileContent => {
        cy.get('input#uploadFileTable').attachFile({
          fileContent,
          fileName: newFile
        });
      });
    });
  });
  cy.get('div.treeview > ul > li', {timeout: 10000}).should('have.length', 3);
  cy.get('div.treeview > ul > li:contains(Simple report):not(:contains(other))').should('have.length', 3)
}
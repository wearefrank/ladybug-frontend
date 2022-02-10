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
        cy.readFile(downloadsFolder + Cypress.env('FILESEP') + newFile, 'binary', { timeout: 15000 })
        .should(buffer => expect(buffer.length).to.be.gt(10));      
      });
    });
  });
});
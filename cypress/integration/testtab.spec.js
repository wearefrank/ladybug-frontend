describe('About the Test tab', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('');
    copyTheReportsToTestTab();
  });

  afterEach(() => {
    cy.clearDebugStore();
    cy.get('li#debugTab').click();
    cy.get('button[id="CloseAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 0);
    cy.get('li#testTab').click();
    // Give UI time to build up the test tab.
    cy.wait(1000);
    cy.get('#SelectAllButton').click();
    cy.get('#DeleteSelectedButton').click();
    cy.get('#testReports tr', {timeout: 10000}).should('have.length', 0);
    cy.get('li#debugTab').click();
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('deleteDownloads', {downloadsPath: downloadsFolder, fileSep: Cypress.env('FILESEP')});
  });

  it('Test deleting a report', function() {
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
    testTabSelectReportNamed('name');
    cy.get('#DeleteSelectedButton').click();
    cy.get('#testReports').find('tr').should('have.length', 1).within(function($reports) {
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
  });

  it('Test select all by deleting', function() {
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
    cy.get('#SelectAllButton').click();
    checkTestTabTwoReportsSelected();
    cy.get('#DeleteSelectedButton').click();
    cy.get('#testReports').find('tr').should('have.length', 0);
  });

  it('Test deselect all', function() {
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
    cy.get('#SelectAllButton').click();
    checkTestTabTwoReportsSelected();
    cy.get('#DeselectAllButton').click();
    cy.get('#DeleteSelectedButton').click();
    cy.wait(5000);
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
  });

  it('Download and upload', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
    cy.get('#SelectAllButton').click();
    cy.task('downloads', downloadsFolder).then(filesBefore => {
      cy.get('#DownloadBinaryButton').click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then(filesAfter => {
        const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
        // TODO: Expect "Ladybug Test", but wait before that has been implemented.
        expect(newFile).to.contain('Ladybug');
        expect(newFile).to.contain('2 reports');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
        .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
          cy.log(`Number of read bytes: ${buffer.length}`);
        });
        // Give the system time to finish downloading
        cy.wait(5000);
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
        .then((rawContent) => {
          console.log(`Have content of uploaded file, length ${rawContent.length}`);
          return Cypress.Blob.binaryStringToBlob(rawContent);
        })
        .then(fileContent => {
          console.log(`Have transformed content length ${fileContent.length}`);
          cy.get('input#uploadFileTest').attachFile({
            fileContent,
            fileName: newFile
          });
        });
      });  
    });
    cy.get('#testReports tr', {timeout: 10000}).should('have.length', 4);
    cy.get('#testReports tr td:nth-child(4):contains(/name)').should('have.length', 2);
    cy.get('#testReports tr td:nth-child(4):contains(/otherName)').should('have.length', 2);
  });

  it('Download from tab test, upload to tab debug', function() {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('li#testTab').click();
    cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 1);
      cy.wrap($reports).contains('/otherName').should('have.length', 1);
    });
    testTabSelectReportNamed('name');
    cy.task('downloads', downloadsFolder).then(filesBefore => {
      cy.log('Before download, downloads folder contains files: ' + filesBefore.toString());
      cy.get('#DownloadBinaryButton').click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then(filesAfter => {
        cy.log('After download, downloads folder contains files: ' + filesAfter.toString());
        const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
        expect(newFile).to.contain('name.ttr');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
        .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
          cy.log(`Number of read bytes: ${buffer.length}`);
        });
        cy.get('li#debugTab').click();
        // Wait for the front-end to complete showing the page
        cy.get('div.treeview > ul > li').should('have.length', 6);
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
        cy.get('div.treeview > ul > li').should('have.length', 9);
        cy.get('div.treeview > ul > li:contains(name)').should('have.length', 6);
      });
    });
  });
});

function copyTheReportsToTestTab() {
  cy.get('button[id="OpenAllButton"]').click();
  // We test many times already that opening two reports yields six nodes.
  // Adding the test here again has another purpose. We want the DOM to
  // be stable before we go on with the test. Without this guard, the test
  // was flaky because the selectIfNotSelected() custom command accessed
  // a detached DOM element.
  cy.get('div.treeview > ul > li').should('have.length', 6);
  cy.get('div.treeview > ul > li:contains(name)').first().selectIfNotSelected();
  cy.get('button#CopyButton').click();
  cy.get('div.treeview > ul > li:contains(otherName)').first().selectIfNotSelected();
  cy.get('button#CopyButton').click();
}

function checkTestTabTwoReportsSelected() {
  cy.get('#testReports tr [type=checkbox]').should('have.length', 2).each(($checkbox) => {
    cy.wrap($checkbox).should('be.checked');
  });
}

function testTabSelectReportNamed(nameToSelect) {
  cy.get('#testReports').find('tr').each(function($reportRow) {
    cy.log('Considering next report');
    const reportName = $reportRow.find('td').eq(3).text();
    cy.log('Name of report is: ' + reportName);
    if(reportName.includes(nameToSelect)) {
      cy.log('Found checkbox of report with name name, checking it');
      cy.wrap($reportRow).find('[type=checkbox]').check();
    };
    cy.get('#testReports tr [type=checkbox]:checked').should('have.length', 1);
    cy.wait(1000);
  });
}

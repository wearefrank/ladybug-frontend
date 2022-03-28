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
      cy.wrap($reports).each(function($reportRow) {
        cy.log('Considering next report');
        const reportName = $reportRow.find('td').eq(3).text();
        cy.log('Name of report is: ' + reportName);
        if(reportName.includes('name')) {
          cy.log('Found checkbox of report with name name, checking it');
          cy.wrap($reportRow).find('[type=checkbox]').check();
        };
      });
    });
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
    cy.get('#testReports tr', {timeout: 10000}).should('have.length', 4).within(function($reports) {
      cy.wrap($reports).contains('/name').should('have.length', 2);
      cy.wrap($reports).contains('/otherName').should('have.length', 2);
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

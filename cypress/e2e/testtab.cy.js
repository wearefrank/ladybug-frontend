describe('About the Test tab', () => {
  before(() => {
    cy.resetApp();
  });

  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
    const storageIds = [];
    cy.get('[data-cy-debug="tableBody"] tr').each($row => {
      cy.wrap($row).find('td:eq(1)').invoke('text').then(s => {
        storageIds.push(s);
        cy.log(`Table has storage id ${s}`);
      });
    });
    cy.get('[data-cy-debug="tableBody"] tr').then(() => {
      cy.log(`Table has storage ids: [${storageIds}]`);
    });
    // When making videos is enabled, the number of frames is limited.
    // We want to see these storage ids. This is the reason for this wait.
    cy.wait(2000);
    // When https://github.com/wearefrank/ladybug-frontend/issues/439 will have been fixed,
    // make the argument true. Then this function can be refactored to have no argument again.
    copyTheReportsToTestTab();
  });

  afterEach(() => cy.resetApp());

  it('Test deleting a report', () => {
    cy.navigateToTestTabAndWait();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="deselectAll"]').click();
    cy.get('[data-cy-test="table"]').contains('Simple report').parent('tr').find('[data-cy-test="reportChecked"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableReportsAre(['Another simple report']);
    cy.get('[data-cy-test="selectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  it('Test select all by deleting', () => {
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    checkTestTabTwoReportsSelected();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
    cy.checkTestTableNumRows(0);
  });

  it('Test deselect all', () => {
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.wait(100);
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    checkTestTabTwoReportsSelected();
    cy.get('[data-cy-test="deselectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.wait(1000);
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    cy.get('[data-cy-test="deleteSelected"]').click();
    cy.get('[data-cy-delete-modal="confirm"]').click();
  });

  // Fails because of https://github.com/wearefrank/ladybug-frontend/issues/249.
  // There is also something strange with the beforeEach() here. After the
  // preparation two reports are expected in the test tab, but there is only one.
  xit('Download and upload', () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.get('[data-cy-nav-tab="testTab"]').click();
    cy.checkTestTableNumRows(2);
    cy.get('[data-cy-test="selectAll"]').click();
    cy.task('downloads', downloadsFolder).then((filesBefore) => {
      cy.get('[data-cy-test="downloadBinary"]').click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then((filesAfter) => {
        const newFile = filesAfter.filter(
          (file) => !filesBefore.includes(file),
        )[0];
        expect(newFile).to.contain('Ladybug Test');
        expect(newFile).to.contain('2 reports');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .should((buffer) => expect(buffer.length).to.be.gt(10))
          .then((buffer) => {
            cy.log(`Number of read bytes: ${buffer.length}`);
          });
        // Give the system time to finish downloading
        cy.wait(1000);
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .then((rawContent) => {
            console.log(
              `Have content of uploaded file, length ${rawContent.length}`,
            );
            return Cypress.Blob.binaryStringToBlob(rawContent);
          })
          .then((fileContent) => {
            console.log(
              `Have transformed content length ${fileContent.length}`,
            );
            cy.get('[data-cy-test="uploadFile"]').attachFile({
              fileContent,
              fileName: newFile,
            });
          });
      });
    });
    cy.checkTestTableNumRows(4);
    cy.get('[data-cy-test="table"] tr td:nth-child(3):contains(/Simple report)').should(
      'have.length',
      2,
    );
    cy.get(
      '[data-cy-test="table"] tr td:nth-child(3):contains(/Another simple report)',
    ).should('have.length', 2);
  });

  // TODO : I have no idea what happens here
  // it('Download from tab test, upload to tab debug', () => {
  //   const downloadsFolder = Cypress.config('downloadsFolder');
  //   cy.get('li#testTab').click();
  //   cy.get('[data-cy-test="table"]').find('tr').should('have.length', 2).within(function($reports) {
  //     cy.wrap($reports).contains('/Simple report').should('have.length', 1);
  //     cy.wrap($reports).contains('/Another simple report').should('have.length', 1);
  //   });
  //   cy.functions.testTabSelectReportNamed('Simple report');
  //   cy.task('downloads', downloadsFolder).then(filesBefore => {
  //     cy.log('Before download, downloads folder contains files: ' + filesBefore.toString());
  //     cy.get('[data-cy-test="downloadBinary"]').click();
  //     cy.log('Waiting for ' + filesBefore.length)
  //     cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
  //     cy.task('downloads', downloadsFolder).then(filesAfter => {
  //       cy.log('After download, downloads folder contains files: ' + filesAfter.toString());
  //       const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
  //       expect(newFile).to.contain('Simple report.ttr');
  //       cy.readFile(cy.functions.downloadPath(newFile), 'binary')
  //       .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
  //         cy.log(`Number of read bytes: ${buffer.length}`);
  //       });
  //       cy.get('li#debugTab').click();
  //       // Wait for the front-end to complete showing the page
  //       cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root li').should('have.length', 2);
  //       cy.readFile(cy.functions.downloadPath(newFile), 'binary')
  //       .then((rawContent) => {
  //         console.log(`Have content of uploaded file, length ${rawContent.length}`);
  //         return Cypress.Blob.binaryStringToBlob(rawContent);
  //       })
  //       .then(fileContent => {
  //         console.log(`Have transformed content length ${fileContent.length}`);
  //         cy.get('[data-cy-debug="upload"]').attachFile({
  //           fileContent,
  //           fileName: newFile
  //         });
  //       });
  //       cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root li').should('have.length', 3);
  //       cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root li:contains(Simple report)').should('have.length', 2);
  //     });
  //   });
  // });
});

function copyTheReportsToTestTab() {
  cy.enableShowMultipleInDebugTree();
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="openSelected"]').click();
  // We test many times already that opening two reports yields six nodes.
  // Adding the test here again has another purpose. We want the DOM to
  // be stable before we go on with the test. Without this guard, the test
  // was flaky because the selectIfNotSelected() custom command accessed
  // a detached DOM element.
  cy.wait(100);
  cy.checkFileTreeLength(2);
  cy.wait(100);
  // TODO: Uncomment this line when the sequence in the debug tree has been fixed.
  // cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(0).find('.item-name').eq(0).click();
  // TODO: And at that time also remove the line below.
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Simple report').click()
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Simple report', 3, 'first');
  cy.wait(100);
  // TODO: Same as above.
  // cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(1).find('.item-name').eq(0).click();
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').contains('Another simple report').click()
  cy.wait(100);
  cy.debugTreeGuardedCopyReport('Another simple report', 3, 'second');
  cy.wait(1000);
}

function checkTestTabTwoReportsSelected() {
  cy.get('[data-cy-test="table"] tr [type=checkbox]')
    .should('have.length', 2)
    .each(($checkbox) => {
      cy.wrap($checkbox).should('be.checked');
    });
}


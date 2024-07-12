const path = require('path');

describe('Debug tab download', function () {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.visit('');
    cy.wait(500);
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
    cy.task('deleteDownloads', {
      downloadsPath: downloadsFolder,
      fileSep: Cypress.env('FILESEP'),
    });
  });

  // Fails because of issue https://github.com/wearefrank/ladybug-frontend/issues/249.
  // TODO: Fix issue and re-enable test.
  xit('Download and upload table', function () {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('downloads', downloadsFolder).then((filesBefore) => {
      cy.getTableBody()
        .find('tr')
        .should('have.length', 2);
      cy.get('[data-cy-debug="download"]').click();
      cy.get('[data-cy-debug="root"]')
        .find('button:contains("XML & Binary")[class="dropdown-item"]')
        .click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then((filesAfter) => {
        const newFile = filesAfter.filter(
          (file) => !filesBefore.includes(file)
        )[0];
        expect(newFile).to.contain('Ladybug Debug');
        expect(newFile).to.contain('2 reports');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .should((buffer) => expect(buffer.length).to.be.gt(10))
          .then((buffer) => {
            cy.log(`Number of read bytes: ${buffer.length}`);
          });
        cy.clearDebugStore();
        cy.get('[data-cy-debug="refresh"]').click();
        cy.assertDebugTableLength(0);
        cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
          'have.length',
          0
        );
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .then((rawContent) => {
            console.log(
              `Have content of uploaded file, length ${rawContent.length}`
            );
            return Cypress.Blob.binaryStringToBlob(rawContent);
          })
          .then((fileContent) => {
            console.log(
              `Have transformed content length ${fileContent.length}`
            );
            cy.get('[data-cy-debug="upload"]').attachFile({
              fileContent,
              fileName: newFile,
            });
          });
        cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
          'have.length',
          0
        );
        cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
          'have.length',
          2
        );
      });
    });
  });

  // Fails because of issue https://github.com/wearefrank/ladybug-frontend/issues/249.
  // TODO: Fix issue and re-enable test.
  xit('Download all open reports', function () {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.functions.assertDebugTableLength(2);
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 2);
    cy.get(
      '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Simple report)'
    ).should('have.length', 1);
    cy.get(
      '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Another simple report)'
    ).should('have.length', 1);
    // Debug store should not be cleared, because the report being downloaded
    // is requested here from the backend. The backend should still have the
    // report to have a valid test.
    cy.task('downloads', downloadsFolder)
      .should('have.length.at.least', 0)
      .then((filesBefore) => {
        cy.get('[data-cy-debug-tree="download"]').click();
        cy.get(
          '[data-cy-debug-tree="buttons"] button:contains("XML & Binary")[class="dropdown-item"]'
        ).click();
        cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
        cy.task('downloads', downloadsFolder).then((filesAfter) => {
          const newFile = filesAfter.filter(
            (file) => !filesBefore.includes(file)
          )[0];
          expect(newFile).to.contain('Ladybug Debug');
          expect(newFile).to.contain('2 reports');
          cy.readFile(cy.functions.downloadPath(newFile), 'binary')
            .should((buffer) => expect(buffer.length).to.be.gt(10))
            .then((buffer) => {
              cy.log(`Number of read bytes: ${buffer.length}`);
            });
          cy.get('[data-cy-debug-tree="closeAll"]').click();
          cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
            'have.length',
            0
          );
          cy.readFile(cy.functions.downloadPath(newFile), 'binary')
            .then(Cypress.Blob.binaryStringToBlob)
            .then((fileContent) => {
              cy.get('[data-cy-debug="upload"]').attachFile({
                fileContent,
                fileName: newFile,
              });
            });
        });
      });
    cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 2);
    cy.get(
      '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Simple report)'
    ).should('have.length', 1);
    cy.get(
      '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Another simple report)'
    ).should('have.length', 1);
  });

  // Fails because of issue https://github.com/wearefrank/ladybug-frontend/issues/249.
  // TODO: Fix issue and re-enable test.
  xit('Download displayed report, from root node', function () {
    testDownloadFromNode(0);
  });

  // Fails because of issue https://github.com/wearefrank/ladybug-frontend/issues/249.
  // TODO: Fix issue and re-enable test.
  xit('Download displayed report, from start node', function () {
    testDownloadFromNode(1);
  });

  // Fails because of issue https://github.com/wearefrank/ladybug-frontend/issues/249.
  // TODO: Fix issue and re-enable test.
  xit('Download displayed report, from end node', function () {
    testDownloadFromNode(2);
  });
});

function testDownloadFromNode(nodeNum) {
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.wait(100);
  cy.functions.assertDebugTableLength(2);
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="openSelected"]').click();
  cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 2);
  cy.get(
    '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Simple report)'
  ).should('have.length', 1);
  cy.get(
    '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Another simple report)'
  ).should('have.length', 1);
  // Debug store should not be cleared, because the report being downloaded
  // is requested here from the backend. The backend should still have the
  // report to have a valid test.
  //
  // We can not click the node to select it because it is selected already.
  // If we click, we unselect it and then no node is selected anymore.
  let string = "";
  for (let i = 0; i < nodeNum; i++) {
    string += "> ul > li";
  }
  cy.wait(100);
  cy.get(
    `.jqx-tree-dropdown-root > li:contains(Simple report):not(li:contains(Another))` +
      string +
      " > div"
  ).click();
  cy.task('downloads', downloadsFolder)
    .should('have.length', 1)
    .then((filesBefore) => {
      cy.get('[data-cy-debug-editor="download"]').click();
      cy.get(
        '[data-cy-debug-editor="buttons"] button:contains("Binary"):not(:contains("XML"))[class="dropdown-item"]'
      ).click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task('downloads', downloadsFolder).then((filesAfter) => {
        const newFile = filesAfter.filter(
          (file) => !filesBefore.includes(file)
        )[0];
        expect(newFile).to.contain('Simple report.ttr');
        expect(newFile).not.to.contain('other');
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .should((buffer) => expect(buffer.length).to.be.gt(10))
          .then((buffer) => {
            cy.log(`Number of read bytes: ${buffer.length}`);
          });
        cy.get('[data-cy-debug-tree="closeAll"]').click();
        cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
          'have.length',
          0
        );
        cy.readFile(cy.functions.downloadPath(newFile), 'binary')
          .then(Cypress.Blob.binaryStringToBlob)
          .then((fileContent) => {
            cy.get('[data-cy-debug="upload"]').attachFile({
              fileContent,
              fileName: newFile,
            });
          });
      });
    });
  cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should(
    'have.length',
    1
  );
  cy.get(
    '[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Simple report):not(:contains(other))'
  ).should('have.length', 1);
}

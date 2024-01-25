describe("About the Test tab", function () {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.visit("");
    copyTheReportsToTestTab();
    // Give the server time to process the request.
    // TODO: Find a better way to implement this than a timeout.
    cy.wait(1000);
  });

  afterEach(() => {
    cy.clearDebugStore();
    cy.get("[data-cy-nav-tab='debugTab']").click();
    cy.get('button[id="CloseAllButton"]').click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 0);
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("#testReports tr", { timeout: 10000 }).should("have.length", 0);
    cy.get("[data-cy-nav-tab='debugTab']").click();
    const downloadsFolder = Cypress.config("downloadsFolder");
    // cy.task("deleteDownloads", {
    //   downloadsPath: downloadsFolder,
    //   fileSep: Cypress.env("FILESEP"),
    // });
  });

  it("Test deleting a report", () => {
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("#testReports").find("tr").should("have.length", 2);
    cy.functions.testTabDeselectReportNamed("/Another simple report");
    cy.get("[data-cy-test-table='deleteSelected']").click();
    cy.get("[data-cy-delete-modal-function='confirmDeletion']").click();
    cy.get("#testReports")
      .find("tr")
      .should("have.length", 1)
      .within(function ($reports) {
        cy.wrap($reports).contains("/Another simple report");
      });
    cy.get("[data-cy-test-table='selectAll']").click();
    cy.get("[data-cy-test-table='deleteSelected']").click();
    cy.get("[data-cy-delete-modal-function='confirmDeletion']").click();
  });

  it("Test select all by deleting", function () {
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("#testReports").find("tr").should("have.length", 2);

    cy.get("[data-cy-test-table='selectAll']").click();
    checkTestTabTwoReportsSelected();
    cy.get("[data-cy-test-table='deleteSelected']").click();
    cy.get("[data-cy-delete-modal-function='confirmDeletion']").click();
    cy.get("#testReports").find("tr").should("have.length", 0);
  });

  it("Test deselect all", function () {
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.wait(100);
    cy.get("#testReports").find("tr").should("have.length", 2);
    cy.get("[data-cy-test-table='selectAll']").click();
    checkTestTabTwoReportsSelected();
    cy.get("#DeselectAllButton").click();
    cy.get("[data-cy-test-table='deleteSelected']").click();
    cy.wait(1000);
    cy.get("#testReports").find("tr").should("have.length", 2);
    cy.get("[data-cy-test-table='selectAll']").click();
    cy.get("[data-cy-test-table='deleteSelected']").click();
    cy.get("[data-cy-delete-modal-function='confirmDeletion']").click();
  });

  // Fails because of https://github.com/ibissource/ladybug-frontend/issues/249.
  // There is also something strange with the beforeEach() here. After the
  // preparation two reports are expected in the test tab, but there is only one.
  xit("Download and upload", function () {
    const downloadsFolder = Cypress.config("downloadsFolder");
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("#testReports").find("tr").should("have.length", 2);
    cy.get("[data-cy-test-table='selectAll']").click();
    cy.task("downloads", downloadsFolder).then((filesBefore) => {
      cy.get("#DownloadBinaryButton").click();
      cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
      cy.task("downloads", downloadsFolder).then((filesAfter) => {
        const newFile = filesAfter.filter(
          (file) => !filesBefore.includes(file)
        )[0];
        expect(newFile).to.contain("Ladybug Test");
        expect(newFile).to.contain("2 reports");
        cy.readFile(cy.functions.downloadPath(newFile), "binary", {
          timeout: 15000,
        })
          .should((buffer) => expect(buffer.length).to.be.gt(10))
          .then((buffer) => {
            cy.log(`Number of read bytes: ${buffer.length}`);
          });
        // Give the system time to finish downloading
        cy.wait(1000);
        cy.readFile(cy.functions.downloadPath(newFile), "binary")
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
            cy.get("input#uploadFileTest").attachFile({
              fileContent,
              fileName: newFile,
            });
          });
      });
    });
    cy.get("#testReports tr", { timeout: 10000 }).should("have.length", 4);
    cy.get("#testReports tr td:nth-child(3):contains(/Simple report)").should(
      "have.length",
      2
    );
    cy.get(
      "#testReports tr td:nth-child(3):contains(/Another simple report)"
    ).should("have.length", 2);
  });

  // TODO : I have no idea what happens here
  // it('Download from tab test, upload to tab debug', function() {
  //   const downloadsFolder = Cypress.config('downloadsFolder');
  //   cy.get('li#testTab').click();
  //   cy.get('#testReports').find('tr').should('have.length', 2).within(function($reports) {
  //     cy.wrap($reports).contains('/Simple report').should('have.length', 1);
  //     cy.wrap($reports).contains('/Another simple report').should('have.length', 1);
  //   });
  //   cy.functions.testTabSelectReportNamed('Simple report');
  //   cy.task('downloads', downloadsFolder).then(filesBefore => {
  //     cy.log('Before download, downloads folder contains files: ' + filesBefore.toString());
  //     cy.get('#DownloadBinaryButton').click();
  //     cy.log('Waiting for ' + filesBefore.length)
  //     cy.waitForNumFiles(downloadsFolder, filesBefore.length + 1);
  //     cy.task('downloads', downloadsFolder).then(filesAfter => {
  //       cy.log('After download, downloads folder contains files: ' + filesAfter.toString());
  //       const newFile = filesAfter.filter(file => !filesBefore.includes(file))[0];
  //       expect(newFile).to.contain('Simple report.ttr');
  //       cy.readFile(cy.functions.downloadPath(newFile), 'binary', {timeout: 15000})
  //       .should(buffer => expect(buffer.length).to.be.gt(10)).then(buffer => {
  //         cy.log(`Number of read bytes: ${buffer.length}`);
  //       });
  //       cy.get('li#debugTab').click();
  //       // Wait for the front-end to complete showing the page
  //       cy.get('#debug-tree .jqx-tree-dropdown-root li').should('have.length', 2);
  //       cy.readFile(cy.functions.downloadPath(newFile), 'binary')
  //       .then((rawContent) => {
  //         console.log(`Have content of uploaded file, length ${rawContent.length}`);
  //         return Cypress.Blob.binaryStringToBlob(rawContent);
  //       })
  //       .then(fileContent => {
  //         console.log(`Have transformed content length ${fileContent.length}`);
  //         cy.get('input#uploadFileTable').attachFile({
  //           fileContent,
  //           fileName: newFile
  //         });
  //       });
  //       cy.get('#debug-tree .jqx-tree-dropdown-root li').should('have.length', 3);
  //       cy.get('#debug-tree .jqx-tree-dropdown-root li:contains(Simple report)').should('have.length', 2);
  //     });
  //   });
  // });
});

function copyTheReportsToTestTab() {
  cy.enableShowMultipleInDebugTree();
  cy.get("[data-cy-debug-table='selectAll']").click();
  cy.get('button[id="OpenSelectedReportsButton"]').click();
  // We test many times already that opening two reports yields six nodes.
  // Adding the test here again has another purpose. We want the DOM to
  // be stable before we go on with the test. Without this guard, the test
  // was flaky because the selectIfNotSelected() custom command accessed
  // a detached DOM element.
  cy.wait(100);
  cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 2);
  cy.wait(100);
  cy.get(
    "#debug-tree .jqx-tree-dropdown-root > li:contains(Simple report) > div"
  ).click();
  cy.wait(100);
  cy.get("button#CopyButton").click();
  cy.wait(100);
  cy.get(
    "#debug-tree .jqx-tree-dropdown-root > li:contains(Another simple report) > div"
  ).click();
  cy.wait(100);
  cy.get("button#CopyButton").click();
  cy.wait(1000);
}

function checkTestTabTwoReportsSelected() {
  cy.get("#testReports tr [type=checkbox]")
    .should("have.length", 2)
    .each(($checkbox) => {
      cy.wrap($checkbox).should("be.checked");
    });
}

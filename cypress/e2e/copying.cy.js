describe("Tests about copying", function () {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  afterEach(() => {
    cy.get("li#testTab").click();
    cy.get("#SelectAllButton").click();
    cy.get(".row #DeleteSelectedButton").click();
    cy.get("#confirmDeletion").click();
    cy.get("#debugTab").click();
  });

  it("Copy report to test tab", () => {
    cy.visit("");
    cy.get("#testTab").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("not.exist");
    cy.createReport();
    cy.get("#debugTab").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("not.exist");
    cy.get(".row #RefreshButton").click();
    cy.get("#metadataTable tbody").find("tr").should("have.length", 1);
    cy.get("[data-cy-select-all-reports]").click();
    cy.get('button[id="OpenSelectedReportsButton"]').click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    cy.get("button#CopyButton").click();
    cy.get("li#testTab").click();
    // We test that the user does not have to refresh here.
    cy.get("tbody#testReports").find("tr").should("have.length", 1);
    cy.get("tbody#testReports")
      .find("tr")
      .contains("/Simple report")
      .should("have.length", 1);
    cy.get("#debugTab").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("have.length", 1);
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    cy.get("li#testTab").click();
    // Do not refresh. The test tab should have saved its state.
    cy.get("tbody#testReports").find("tr").should("have.length", 1);
    cy.get("tbody#testReports")
      .find("tr")
      .contains("/Simple report")
      .should("have.length", 1);
  });
});

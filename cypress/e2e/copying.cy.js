describe("Tests about copying", function () {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  afterEach(() => {
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("[data-cy-test='selectAll']").click();
    cy.get("[data-cy-test='deleteSelected']").click();
    cy.get("[data-cy-delete-modal='confirm']").click();
    cy.get("[data-cy-nav-tab='debugTab']").click();
  });

  it("Copy report to test tab", () => {
    cy.visit("");
    cy.get("[data-cy-nav-tab='testTab']").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("not.exist");
    cy.createReport();
    cy.get("[data-cy-nav-tab='debugTab']").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("not.exist");
    cy.get("[data-cy-debug='refresh']").click();
    cy.get("#metadataTable tbody").find("tr").should("have.length", 1);
    cy.get("[data-cy-debug='selectAll']").click();
    cy.get("[data-cy-debug='openSelected']").click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    cy.get("button#CopyButton").click();
    cy.get("[data-cy-nav-tab='testTab']").click();
    // We test that the user does not have to refresh here.
    cy.get("tbody#testReports").find("tr").should("have.length", 1);
    cy.get("tbody#testReports")
      .find("tr")
      .contains("/Simple report")
      .should("have.length", 1);
    cy.get("[data-cy-nav-tab='debugTab']").click();
    cy.get("#metadataTable tbody", { timeout: 10000 })
      .find("tr")
      .should("have.length", 1);
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    cy.get("[data-cy-nav-tab='testTab']").click();
    // Do not refresh. The test tab should have saved its state.
    cy.get("tbody#testReports").find("tr").should("have.length", 1);
    cy.get("tbody#testReports")
      .find("tr")
      .contains("/Simple report")
      .should("have.length", 1);
  });
});

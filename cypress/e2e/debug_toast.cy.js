describe("Test toast window", function () {
  beforeEach(function () {
    cy.clearDebugStore();
  });

  it("When new report appears in table then toast window shown", function () {
    cy.visit("");
    cy.get("[data-cy-debug='tableBody']").find("tr").should("not.exist");
    cy.createReport();
    cy.get("[data-cy-debug='refresh']").click();
    cy.wait(100);
    cy.get("[data-cy-toast]").contains("Data loaded!");
    cy.get("[data-cy-debug='tableBody']").find("tr").should("have.length", 1);
  });
});

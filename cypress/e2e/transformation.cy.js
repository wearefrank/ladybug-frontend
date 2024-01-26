describe("Report transformation", () => {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  afterEach(() => {
    cy.clearDebugStore();
    cy.get("[data-cy-debug-table='openSettings']").click();
    // Factory reset in settings dialog. Resets
    // transformation to factory value.
    cy.get('button[title ^= "Reset and save factory settings"]').click();
    cy.get("button[id=saveTableSettings]").click();
  });

  it("Update transformation", function () {
    cy.visit("");
    cy.get("[data-cy-debug-table='openSettings']").click();
    cy.get("textarea[formcontrolname=transformation]").type("{selectAll}");
    cy.get("textarea[formcontrolname=transformation]").type("{del}");
    cy.get("textarea[formcontrolname=transformation]").within((textArea) => {
      cy.fixture("ignoreName.xslt").then((newText) =>
        cy.wrap(textArea).type(newText)
      );
    });
    cy.get(
      "input[type=checkbox][formcontrolname=transformationEnabled]"
    ).check();
    cy.get("button[id=saveTableSettings]").click();
    cy.createOtherReport();
    cy.get("[data-cy-debug-table='refresh']").click();

    cy.wait(100);
    cy.get(".table-responsive tbody")
      .find("tr")
      .should("have.length", 1)
      .click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    // We test that the top node was not selected before.
    cy.get("#debug-tree .jqx-tree-dropdown-root > li > div").click();
    cy.get("[data-cy-open-metadata-table]").click();
    cy.get("#editor").contains('Name="IGNORED"');
    // The transformation should not affect the report table, only the XML in the Monaco editor
    cy.get("[data-cy-metadata-table-reportname]").should(
      "have.text",
      "Name: Another simple report"
    );
  });
});

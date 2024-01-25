describe("Test labels", function () {
  beforeEach(() => {
    cy.clearDebugStore();
  });

  afterEach(function () {
    cy.get('button[id="CloseAllButton"]').click();
  });

  it("Test label null", function () {
    cy.createReportWithLabelNull();
    cy.visit("");
    cy.get("[data-cy-debug-table='selectAll']").click();
    cy.get('button[id="OpenSelectedReportsButton"]').click();
    cy.wait(300);
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    testTreeView("Message is null", "Null String");
  });

  it("Test label empty string", function () {
    cy.createReportWithLabelEmpty();
    cy.visit("");
    cy.get("[data-cy-debug-table='selectAll']").click();
    cy.get('button[id="OpenSelectedReportsButton"]').click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    testTreeView("Message is an empty string", "Empty String");
  });
});

function testTreeView(reportName, labelString) {
  cy.get("#debug-tree .jqx-tree-dropdown-root > li > div").within(function (
    $node
  ) {
    cy.wrap($node).contains(reportName);
  });
  cy.get("#debug-tree .jqx-tree-dropdown-root > li > ul > li > div").within(
    function ($node) {
      cy.wrap($node).should("contain", reportName);
      cy.wrap($node)
        .find("img")
        .invoke("attr", "src")
        .should("eq", "assets/tree-icons/startpoint-even.gif");
    }
  );
  cy.get(
    "#debug-tree .jqx-tree-dropdown-root > li > ul > li > ul > li:nth-child(1) > div"
  ).within(function ($node) {
    cy.wrap($node).should("have.text", labelString);
    cy.wrap($node)
      .find("img")
      .invoke("attr", "src")
      .should("eq", "assets/tree-icons/infopoint-odd.gif");
  });
  cy.get(
    "#debug-tree .jqx-tree-dropdown-root > li > ul > li > ul > li:nth-child(2) > div"
  ).within(function ($node) {
    cy.wrap($node).should("have.text", reportName);
    cy.wrap($node)
      .find("img")
      .invoke("attr", "src")
      .should("eq", "assets/tree-icons/endpoint-odd.gif");
  });
}

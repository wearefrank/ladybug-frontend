describe("About opened reports", function () {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.visit("");
  });

  it("Close one", function () {
    cy.enableShowMultipleInDebugTree();
    cy.get("[data-cy-debug='selectAll']").click();
    cy.get("[data-cy-debug='openSelected']").click();
    // Each of the two reports has three lines.
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 2);
    cy.get("#debug-tree .jqx-tree-dropdown-root > li > div").should(
      "contain",
      "Simple report"
    );
    cy.get(
      "#debug-tree .jqx-tree-dropdown-root > li > div:contains(Simple report)"
    )
      .first()
      .selectIfNotSelected();
    cy.get("[data-cy-debug-editor='close']").click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    // nth-child has an 1-based index
    cy.get("#debug-tree .jqx-tree-dropdown-root > li > div")
      .should("have.text", "Another simple report")
      .click();
    cy.get("[data-cy-debug-editor='close']").click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 0);
  });

  it("Close all", function () {
    cy.enableShowMultipleInDebugTree();
    cy.get(".table-responsive tbody tr td:contains(Simple report)")
      .first()
      .click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 1);
    cy.get('.table-responsive tbody tr td:contains("Another simple report")')
      .first()
      .click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 2);
    // Check sequence of opened reports. We expect "Simple report" first, then "Another simple report".
    cy.get("#debug-tree .jqx-tree-dropdown-root li:nth-child(1) > div").should(
      "contain",
      "Simple report"
    );
    cy.get("#debug-tree .jqx-tree-dropdown-root li:nth-child(2) > div").should(
      "have.text",
      "Another simple report"
    );
    cy.get('button[id="CloseAllButton"]').click();
    cy.get("#debug-tree .jqx-tree-dropdown-root > li").should("have.length", 0);
  });

  // // TODO: This can not be tested easily atm, since only the css is changed on expand and collapse
  // it('Expand and collapse', function() {
  //   cy.get('button[id="OpenAllButton"]').click();
  //   cy.get('div.treeview > ul > li').should('have.length', 6);
  //   cy.get('div.treeview > ul > li:contains(Simple report)').within((children) => linesFormExpandedNode(children, 'even'));
  //   cy.get('div.treeview > ul > li:contains(Another simple report)').within((children) => linesFormExpandedNode(children, 'even'));
  //   cy.get('button[id="CollapseAllButton"]').click();
  //   cy.get('div.treeview > ul > li').should('have.length', 2);
  //   cy.get('div.treeview > ul > li:contains(Simple report)').within(linesFormCollapsedNode);
  //   cy.get('div.treeview > ul > li:contains(Another simple report)').within(linesFormCollapsedNode);
  //   cy.get('button[id="ExpandAllButton"]').click();
  //   cy.get('div.treeview > ul > li').should('have.length', 6);
  //   cy.get('div.treeview > ul > li:contains(Simple report)').within((children) => linesFormExpandedNode(children, 'even'));
  //   cy.get('div.treeview > ul > li:contains(Another simple report)').within((children) => linesFormExpandedNode(children, 'even'));
  // });

  // it('Node info corresponds to selected node', function() {
  //   cy.get('button[id="OpenAllButton"]').click();
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 2);
  //   checkNodeInfo('Simple report');
  //   checkNodeInfo('Another simple report');
  // });

  // it('If there are open reports, then always one of them is selected', function() {
  //   cy.get('.table-responsive tbody tr td:contains(Simple report)').first().click();
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 1).each((node) => {
  //     cy.wrap(node).should('have.text', 'Simple report');
  //   });
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1);
  //   // Index is zero-based. We want the first node after the root.
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li:eq(1)').should('have.class', 'node-selected');
  //   cy.get('.table-responsive tbody').find('tr').contains('Another simple report').click();
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 2);
  //   // When you open a new report, the new report is also selected.
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1).should('have.text', 'Another simple report');
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li:contains(Another simple report):eq(1)').should('have.class', 'node-selected');
  //   cy.wait(1000)
  //   cy.get('button#CloseButton').click();
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li').should('have.length', 1).each((node) => {
  //     cy.wrap(node).should('have.text', 'Simple report');
  //   });
  //   cy.get('#debug-tree .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1);
  // });
});

function linesFormExpandedNode($lines, evenOrOdd) {
  const startIcon = `assets/tree-icons/startpoint-${evenOrOdd}.gif`;
  const oddOrEven = evenOrOdd == "even" ? "odd" : "even";
  const endIcon = `assets/tree-icons/endpoint-${oddOrEven}.gif`;
  expect($lines).to.have.length(3);
  expect($lines.eq(0).children()).to.have.length(2);
  expect($lines.eq(0).children().eq(0)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(0).children().eq(0)).to.have.class("expand-icon");
  expect($lines.eq(0).children().eq(0)).to.have.class("fa-minus");
  expect($lines.eq(0).children().eq(1)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(0).children().eq(1)).to.have.class("node-icon");
  expect($lines.eq(0).children("img")).to.have.length(0);
  expect($lines.eq(1).children()).to.have.length(4);
  expect($lines.eq(1).children().eq(0)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(1).children().eq(1)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(1).children().eq(2)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(1).children().eq(3)).to.have.prop("nodeName", "IMG");
  expect($lines.eq(1).children().eq(0)).to.have.class("indent");
  expect($lines.eq(1).children().eq(1)).to.have.class("expand-icon");
  expect($lines.eq(1).children().eq(1)).to.have.class("fa-minus");
  expect($lines.eq(1).children().eq(2)).to.have.class("node-icon");
  expect($lines.eq(1).children().eq(3).attr("src")).to.equal(startIcon);
  expect($lines.eq(2).children()).to.have.length(5);
  expect($lines.eq(2).children().eq(0)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(2).children().eq(1)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(2).children().eq(2)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(2).children().eq(3)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(2).children().eq(4)).to.have.prop("nodeName", "IMG");
  expect($lines.eq(2).children().eq(0)).to.have.class("indent");
  expect($lines.eq(2).children().eq(1)).to.have.class("indent");
  expect($lines.eq(2).children().eq(2)).to.have.class("glyphicon");
  expect($lines.eq(2).children().eq(3)).to.have.class("node-icon");
  expect($lines.eq(2).children().eq(4).attr("src")).to.equal(endIcon);
}

function linesFormCollapsedNode($lines) {
  expect($lines).to.have.length(1);
  expect($lines.eq(0).children()).to.have.length(2);
  expect($lines.eq(0).children().eq(0)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(0).children().eq(1)).to.have.prop("nodeName", "SPAN");
  expect($lines.eq(0).children().eq(0)).to.have.class("expand-icon");
  expect($lines.eq(0).children().eq(0)).to.have.class("fa-plus");
  expect($lines.eq(0).children().eq(1)).to.have.class("node-icon");
}

function checkNodeInfo(name) {
  cy.get(`.jqx-tree-dropdown-root > li:contains(${name}):eq(0)`).click();
  const startOfReportTag = "<Report";
  const wordsInName = name.split(" ");
  const quotedWordsInName = wordsInName.map((word) => '"' + word + '"');
  cy.getShownMonacoModelElement().within(function (shownMonacoElement) {
    cy.wrap(shownMonacoElement).find(`span:contains(${startOfReportTag})`);
    cy.wrap(shownMonacoElement).find("span:contains(Name)");
    quotedWordsInName.forEach((word) => {
      cy.wrap(shownMonacoElement).find(`span:contains(${word})`);
    });
  });
  cy.get("#displayedNodeTable tr:eq(0) td:eq(0)").should("have.text", "Name");
  cy.get("#displayedNodeTable tr:eq(0) td:eq(1)").should(
    "have.text",
    `${name}`
  );
  cy.get("#displayedNodeTable tr:eq(4) td:eq(0)").should(
    "have.text",
    "StorageId"
  );
  cy.get("#displayedNodeTable tr:eq(4) td:eq(1)").should("not.be.empty");
  cy.get(`div.treeview > ul > li:contains(${name}):eq(1)`).click();
  const helloWorld = "Hello\xa0World!";
  cy.getShownMonacoModelElement().find(`span:contains(${helloWorld})`);
  cy.get("#displayedNodeTable tr:eq(0) td:eq(0)").should("have.text", "Name");
  cy.get("#displayedNodeTable tr:eq(0) td:eq(1)").should(
    "have.text",
    `${name}`
  );
  cy.get("#displayedNodeTable tr:eq(5) td:eq(0)").should(
    "have.text",
    "CheckpointUID"
  );
  cy.get("#displayedNodeTable tr:eq(5) td:eq(1)").should("not.be.empty");
  cy.get(`div.treeview > ul > li:contains(${name}):eq(2)`).click();
  const goodbyeWorld = "Goodbye\xa0World!";
  cy.getShownMonacoModelElement().find(`span:contains(${goodbyeWorld})`);
  cy.get("#displayedNodeTable tr:eq(0) td:eq(0)").should("have.text", "Name");
  cy.get("#displayedNodeTable tr:eq(0) td:eq(1)").should(
    "have.text",
    `${name}`
  );
  cy.get("#displayedNodeTable tr:eq(5) td:eq(0)").should(
    "have.text",
    "CheckpointUID"
  );
  cy.get("#displayedNodeTable tr:eq(5) td:eq(1)").should("not.be.empty");
}

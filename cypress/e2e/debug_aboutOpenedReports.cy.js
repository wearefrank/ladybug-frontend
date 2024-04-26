describe('About opened reports', () => {
  beforeEach(() => {
    cy.clearDebugStore();
    cy.createReport();
    cy.createOtherReport();
    cy.initializeApp();
  });

  it('Close one', () => {
    cy.enableShowMultipleInDebugTree();
    cy.get('[data-cy-debug="selectAll"]').click();
    cy.get('[data-cy-debug="openSelected"]').click();
    // Each of the two reports has three lines.
    cy.checkFileTreeLength(2)
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div').should(
      'contain',
      "Simple report"
    );
    cy.get('[data-cy-debug-tree="root"] app-tree-item > div > div:contains(Simple report)')
      .first().selectIfNotSelected();
    cy.get('[data-cy-debug-editor="close"]').click();
    cy.checkFileTreeLength(1)
    // nth-child has an 1-based index
    cy.get('[data-cy-debug-tree="root"] > app-tree-item .item-name').eq(0)
      .should('have.text', "Another simple report")
      .click();
    cy.get('[data-cy-debug-editor="close"]').click();
    cy.get('[data-cy-debug-tree="root"] app-tree-item').should('not.exist');
  });

  it('Close all', () => {
    cy.enableShowMultipleInDebugTree();
    cy.get('[data-cy-debug="tableBody"] tr td:contains(Simple report)')
      .first()
      .click();
    cy.checkFileTreeLength(1)
    cy.get('[data-cy-debug="tableBody"] tr td:contains("Another simple report")')
      .first()
      .click();
    cy.checkFileTreeLength(2)
    // Check sequence of opened reports. We expect "Simple report" first, then "Another simple report".
    cy.get('[data-cy-debug-tree="root"] > app-tree-item:nth-child(1) > div > .sft-item > .item-name').should(
      'have.text',
      'Simple report'
    );
    cy.get('[data-cy-debug-tree="root"] > app-tree-item:nth-child(2) > div > .sft-item > .item-name').eq(0).should(
      'have.text',
      'Another simple report'
    );
    cy.get('[data-cy-debug-tree="closeAll"]').click();
    cy.get('[data-cy-debug-tree="root"] app-tree-item').should('not.exist');
  });

  // // TODO: This can not be tested easily atm, since only the css is changed on expand and collapse
  // it('Expand and collapse', () => {
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

  // it('Node info corresponds to selected node', () => {
  //   cy.get('button[id="OpenAllButton"]').click();
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 2);
  //   checkNodeInfo('Simple report');
  //   checkNodeInfo('Another simple report');
  // });

  // it('If there are open reports, then always one of them is selected', () => {
  //   cy.get('data-cy-debug='tableBody' tr td:contains(Simple report)').first().click();
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 1).each((node) => {
  //     cy.wrap(node).should('have.text', 'Simple report');
  //   });
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1);
  //   // Index is zero-based. We want the first node after the root.
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:eq(1)').should('have.class', 'node-selected');
  //   cy.get('data-cy-debug="tableBody"').find('tr').contains('Another simple report').click();
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 2);
  //   // When you open a new report, the new report is also selected.
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1).should('have.text', 'Another simple report');
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li:contains(Another simple report):eq(1)').should('have.class', 'node-selected');
  //   cy.wait(1000)
  //   cy.get('button#CloseButton').click();
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li').should('have.length', 1).each((node) => {
  //     cy.wrap(node).should('have.text', 'Simple report');
  //   });
  //   cy.get('[data-cy-debug-tree="root"] .jqx-tree-dropdown-root > li.node-selected').should('have.length', 1);
  // });
});

function linesFormExpandedNode($lines, evenOrOdd) {
  const startIcon = `assets/tree-icons/startpoint-${evenOrOdd}.gif`;
  const oddOrEven = evenOrOdd == 'even' ? 'odd' : 'even';
  const endIcon = `assets/tree-icons/endpoint-${oddOrEven}.gif`;
  expect($lines).to.have.length(3);
  expect($lines.eq(0).children()).to.have.length(2);
  expect($lines.eq(0).children().eq(0)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(0)).to.have.class('expand-icon');
  expect($lines.eq(0).children().eq(0)).to.have.class('fa-minus');
  expect($lines.eq(0).children().eq(1)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(1)).to.have.class('node-icon');
  expect($lines.eq(0).children('img')).to.have.length(0);
  expect($lines.eq(1).children()).to.have.length(4);
  expect($lines.eq(1).children().eq(0)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(1).children().eq(1)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(1).children().eq(2)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(1).children().eq(3)).to.have.prop('nodeName', 'IMG');
  expect($lines.eq(1).children().eq(0)).to.have.class('indent');
  expect($lines.eq(1).children().eq(1)).to.have.class('expand-icon');
  expect($lines.eq(1).children().eq(1)).to.have.class('fa-minus');
  expect($lines.eq(1).children().eq(2)).to.have.class('node-icon');
  expect($lines.eq(1).children().eq(3).attr('src')).to.equal(startIcon);
  expect($lines.eq(2).children()).to.have.length(5);
  expect($lines.eq(2).children().eq(0)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(2).children().eq(1)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(2).children().eq(2)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(2).children().eq(3)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(2).children().eq(4)).to.have.prop('nodeName', 'IMG');
  expect($lines.eq(2).children().eq(0)).to.have.class('indent');
  expect($lines.eq(2).children().eq(1)).to.have.class('indent');
  expect($lines.eq(2).children().eq(2)).to.have.class('glyphicon');
  expect($lines.eq(2).children().eq(3)).to.have.class('node-icon');
  expect($lines.eq(2).children().eq(4).attr('src')).to.equal(endIcon);
}

function linesFormCollapsedNode($lines) {
  expect($lines).to.have.length(1);
  expect($lines.eq(0).children()).to.have.length(2);
  expect($lines.eq(0).children().eq(0)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(1)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(0)).to.have.class('expand-icon');
  expect($lines.eq(0).children().eq(0)).to.have.class('fa-plus');
  expect($lines.eq(0).children().eq(1)).to.have.class('node-icon');
}

function checkNodeInfo(name) {
  cy.get(`.jqx-tree-dropdown-root > li:contains(${name}):eq(0)`).click();
  const startOfReportTag = '<Report';
  const wordsInName = name.split(' ');
  const quotedWordsInName = wordsInName.map((word) => '"' + word + '"');
  cy.getShownMonacoModelElement().within((shownMonacoElement) => {
    cy.wrap(shownMonacoElement).find(`span:contains(${startOfReportTag})`);
    cy.wrap(shownMonacoElement).find('span:contains(Name)');
    quotedWordsInName.forEach((word) => {
      cy.wrap(shownMonacoElement).find(`span:contains(${word})`);
    });
  });
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(0)').should('have.text', "Name");
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(1)').should(
    'have.text',
    `${name}`
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(4) td:eq(0)').should(
    'have.text',
    "StorageId"
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(4) td:eq(1)').should('not.be.empty');
  cy.get(`div.treeview > ul > li:contains(${name}):eq(1)`).click();
  const helloWorld = 'Hello\xa0World!';
  cy.getShownMonacoModelElement().find(`span:contains(${helloWorld})`);
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(0)').should('have.text', "Name");
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(1)').should(
    'have.text',
    `${name}`
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(5) td:eq(0)').should(
    'have.text',
    'CheckpointUID'
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(5) td:eq(1)').should('not.be.empty');
  cy.get('[data-cy-debug-tree="root"] > ul > li:contains(${name}):eq(2)').click();
  const goodbyeWorld = "Goodbye\xa0World!";
  cy.getShownMonacoModelElement().find(`span:contains(${goodbyeWorld})`);
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(0)').should('have.text', "Name");
  cy.get('[data-cy-metadata-table="table"] tr:eq(0) td:eq(1)').should(
    'have.text',
    `${name}`
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(5) td:eq(0)').should(
    'have.text',
    'CheckpointUID'
  );
  cy.get('[data-cy-metadata-table="table"] tr:eq(5) td:eq(1)').should('not.be.empty');
}

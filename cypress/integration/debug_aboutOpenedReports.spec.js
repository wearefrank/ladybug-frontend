const REGEX_START_ICON = new RegExp('.*startpoint-(even|odd)\\.gif');
const REGEX_END_ICON = new RegExp('.*endpoint-(even|odd)\\.gif');

describe('About opened reports', function() {
  beforeEach(() => {
    cy.createReport();
    cy.createOtherReport();
    cy.visit('')
  });

  afterEach(() => {
    cy.clearDebugStore();
  });

  it('Close one', function() {
    cy.get('button[id="OpenAllButton"]').click();
    // Each of the two reports has three lines.
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(name)').first().click();
    cy.get('#CloseButton').click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    // nth-child has an 1-based index
    cy.get('div.treeview > ul > li:nth-child(1)').should('have.text', 'otherName').click();
    cy.get('#CloseButton').click();
    cy.get('div.treeview > ul > li').should('have.length', 0);
  });

  it('Close all', function() {
    cy.get('.table-responsive tbody tr td:contains(name)').first().click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    cy.get('.table-responsive tbody tr td:contains("otherName")').first().click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    // Check sequence of opened reports. We expect "name" first, then "otherName".
    cy.get('div.treeview > ul > li:nth-child(1)').should('have.text', 'name');
    cy.get('div.treeview > ul > li:nth-child(4)').should('have.text', 'otherName');
    cy.get('button[id="CloseAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 0);
  })

  it('Expand and collapse', function() {
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(name)').within(linesFormExpandedNode);
    cy.get('div.treeview > ul > li:contains(otherName)').within(linesFormExpandedNode);
    cy.get('button[id="CollapseAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 2);
    cy.get('div.treeview > ul > li:contains(name)').within(linesFormCollapsedNode);
    cy.get('div.treeview > ul > li:contains(otherName)').within(linesFormCollapsedNode);
    cy.get('button[id="ExpandAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 6);
    cy.get('div.treeview > ul > li:contains(name)').within(linesFormExpandedNode);
    cy.get('div.treeview > ul > li:contains(otherName)').within(linesFormExpandedNode);
  });
});

function linesFormExpandedNode($lines) {
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
  expect($lines.eq(1).children().eq(3).attr('src')).to.match(REGEX_START_ICON);
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
  expect($lines.eq(2).children().eq(4).attr('src')).to.match(REGEX_END_ICON);
};

function linesFormCollapsedNode($lines) {
  expect($lines).to.have.length(1);
  expect($lines.eq(0).children()).to.have.length(2);
  expect($lines.eq(0).children().eq(0)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(1)).to.have.prop('nodeName', 'SPAN');
  expect($lines.eq(0).children().eq(0)).to.have.class('expand-icon');
  expect($lines.eq(0).children().eq(0)).to.have.class('fa-plus');
  expect($lines.eq(0).children().eq(1)).to.have.class('node-icon');
}

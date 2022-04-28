describe('Edit tests', function() {
  afterEach(function() {
    cy.clearDebugStore();
    cy.get('li#debugTab a').click();
    cy.get('li#debugTab a:eq(0)').should('have.class', 'active');
    // Wait for debug tab to be rendered
    cy.wait(1000);
    cy.get('button[id="CloseAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 0);
    cy.get('li#testTab').click();
    // Give UI time to build up the test tab.
    cy.wait(1000);
    cy.get('#SelectAllButton').click();
    cy.get('#DeleteSelectedButton').click();
    cy.get('#testReports tr', {timeout: 10000}).should('have.length', 0);
    cy.get('li#debugTab').click();
  });

  it('Edit report in test tab', function() {
    prepareEdit();
    // TODO: These four lines are a work-around for issue https://github.com/ibissource/ladybug-frontend/issues/150
    // These lines should be removed if that issue has been fixed.
    //
    // Doing the "should" right after the "click" does not work. Then you
    // get an error that the element is detached from the DOM.
    // It seems that another node is created when the "click" is handled.
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('not.have.class', 'node-selected');
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('have.class', 'node-selected');
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('#monacoEditor').click().focused().type('{ctrl}a').type('Hello Original World!');
    cy.get('#SaveButton').click()
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.get('.col:not(.text-right)').contains('Hello World!');
    cy.get('.col.text-right').contains('Hello Original World!');
    cy.get('button:contains(Yes)').click();
    cy.get('.treeview ul li:nth-child(3)').click()
    cy.get('.treeview ul li:nth-child(3)').should('have.class', 'node-selected');
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.wait(1000);
    cy.get('#monacoEditor').click().focused().type('{ctrl}a').type('Goodbye Original World!');
    cy.get('#SaveButton').click()
    cy.get('button:contains(Yes)').click();
    cy.get('li#testTab').click();
    cy.get('#RunreportButton').click();
    const GREEN = 'rgb(33, 37, 41)'
    cy.get('span:contains(0/1 stubbed)').should('have.css', 'color', GREEN);
  });

  it('Editing without pressing Edit produces error', function() {
    prepareEdit();
    // TODO: These four lines are a work-around for issue https://github.com/ibissource/ladybug-frontend/issues/150
    // These lines should be removed if that issue has been fixed.
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('not.have.class', 'node-selected');
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('have.class', 'node-selected');
    // Do not press Edit button
    cy.get('#SaveButton').should('have.length', 0);
    cy.get('#monacoEditor').click().type('x');
    cy.contains('Cannot edit');
    cy.get('.message').should('have.length', 0);
  });

  it('When saving edit cancelled then original text kept', function() {
    prepareEdit();
    // TODO: These four lines are a work-around for issue https://github.com/ibissource/ladybug-frontend/issues/150
    // These lines should be removed if that issue has been fixed.
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('not.have.class', 'node-selected');
    cy.get('.treeview ul li:nth-child(2)').click()
    cy.get('.treeview ul li:nth-child(2)').should('have.class', 'node-selected');
    cy.wait(1000);
    cy.get('#EditButton').click();
    cy.wait(1000);
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('#monacoEditor').click().focused().type('{ctrl}a').type('Hello Original World!');
    cy.get('#SaveButton').click()
    cy.get('.modal-title').should('include.text', 'Are you sure');
    cy.contains('Hello Original World!');
    cy.get('button:contains(No)').click();
    cy.contains('Hello World!');
  });
});

function prepareEdit() {
  cy.createReport();
  cy.visit('');
  cy.get('button[id="OpenAllButton"]').click();
  cy.get('div.treeview > ul > li').should('have.length', 3);
  cy.get('button#CopyButton').click();
  cy.get('li#testTab').click();
  cy.get('#testReports tr').should('have.length', 1);
  cy.get('#OpenreportButton').click();
  // Martijn hopes this fixes an issue in Firefox. The test
  // should see that the fourth tab has caption "name".
  cy.wait(2000);
  cy.get('ul.nav-tabs li:nth-child(4)').find('a.active').should('include.text', 'name');
  // Wait until the tab has been rendered
  cy.get('.treeview ul li').should('have.length', 3);
}
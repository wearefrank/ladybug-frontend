describe('Edit tests', function() {
  afterEach(function() {
    cy.clearDebugStore();
    cy.get('li#debugTab').click();
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
    cy.createReport();
    cy.visit('');
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    cy.get('div.treeview > ul > li:contains(name)').first().selectIfNotSelected();
    cy.get('button#CopyButton').click();
    cy.get('li#testTab').click();
    cy.get('#OpenreportButton').click();
    cy.get('.nav-tabs ul li:nth-child:nth-child(4)').find('a.active').should('include.text', 'name');
    // TODO: These two lines are a work-around for issue https://github.com/ibissource/ladybug-frontend/issues/150
    // These lines should be removed if that issue has been fixed.
    cy.get('.treeview ul li:nth-child(2)').click().should('not.have.class', 'node-selected');
    cy.get('.treeview ul li:nth-child(2)').click().should('have.class', 'node-selected');
    //
    // TODO: Test that an error is shown if you try to edit before pressing the edit button.
    cy.get('.displayButtons #EditButton').click();
    // According to https://stackoverflow.com/questions/56617522/testing-monaco-editor-with-cypress
    cy.get('#monacoEditor').click().focused().type('{ctrl}a').type('Hello Original World!');
    // TODO: Test that the text before and the text after the change is shown.
    cy.get('button:contains(Yes)').click();

    cy.get('.treeview ul li:nth-child(3)').click().should('have.class', 'node-selected');
    cy.get('.displayButtons #EditButton').click();
    cy.get('#monacoEditor').click().focused().type('{ctrl}a').type('Goodbye Original World!');
    cy.get('button:contains(Yes)').click();

    cy.get('li#testTab').click();
    cy.get('#RunreportButton').click();
    cy.get('span:contains(0/1 stubbed').should('have.property', 'style', 'color: green;');
  });
});
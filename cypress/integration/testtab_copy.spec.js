import chaiColors from 'chai-colors'
chai.use(chaiColors)

describe('Test copy in testtab', function() {
  beforeEach(function() {
    cy.createReport();
    cy.visit('');
    cy.get('button[id="OpenAllButton"]').click();
    cy.get('div.treeview > ul > li').should('have.length', 3);
    cy.get('button#CopyButton').click();
    cy.get('li#testTab').click();
    cy.get('#testReports tr').should('have.length', 1);
  });

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

  it('Test copy in testtab', function() {
    cy.functions.testTabSelectReportNamed('name');
    cy.get('#CopySelectedButton').click();
    cy.get('#testReports').find('tr').should('have.length', 2);
    cy.get('#testReports').find('tr').each(function($report) {
      cy.wrap($report).find('[type=checkbox]').should('not.be.checked');
      cy.wrap($report).find('td:eq(2)').should('include.text', 'name');
    });
    cy.get('#OpenreportButton:eq(0)').click();
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
    cy.get('#testReports').find('tr').should('have.length', 2);
    cy.get('#testReports tr:eq(0)').find('#RunreportButton').click();
    cy.get('#testReports').find('tr:eq(0)').within(function($report) {
      cy.wrap($report).find('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'green');
    });
    cy.get('#testReports tr:eq(1)').find('#RunreportButton').click();
    cy.get('#testReports').find('tr:eq(1)').within(function($report) {
      cy.wrap($report).find('span:contains(0/1 stubbed)').should('have.css', 'color').and('be.colored', 'red');
    });
  });
})

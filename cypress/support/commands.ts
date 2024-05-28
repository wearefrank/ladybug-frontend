/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

import Chainable = Cypress.Chainable;

Cypress.Commands.add('initializeApp' as keyof Chainable, () => {
  //Custom command to initialize app and wait for all api requests
  cy.intercept({
    method: 'GET',
    hostname: 'localhost',
    url: /\/api\/*?/g,
  }).as('apiCall');
  cy.visit('');
  cy.wait('@apiCall').then(() =>
    cy.log('All api requests have completed'),
  );
});

Cypress.Commands.add('resetApp' as keyof Chainable, () => {
  cy.clearDebugStore();
  cy.initializeApp();
  cy.get('[data-cy-debug="selectAll"]').click();
  cy.get('[data-cy-debug="delete"]').click();
  cy.intercept({
    method: 'GET',
    hostname: 'localhost',
    url: /\/api\/*?/g,
  }).as('deleteAll');
  cy.visit('');
  cy.wait('@deleteAll').then(() =>
    cy.log('Successfully removed files'),
  );
  cy.deleteAllTestReports();
  cy.initializeApp();
});

Cypress.Commands.add('navigateToTestTabAndWait' as keyof Chainable, () => {
  navigateToTabAndWait('test');
});

Cypress.Commands.add('navigateToDebugTabAndWait' as keyof Chainable, () => {
  navigateToTabAndWait('debug');
});

//More string values can be added for each tab that can be opened
function navigateToTabAndWait(tab: 'debug' | 'test') {
  const apiCallAlias = `apiCall${tab}Tab`;
  cy.intercept({ method: 'GET', hostname: 'localhost', url: /\/api\/*?/g }).as(apiCallAlias);
  cy.visit('');
  cy.get(`[data-cy-nav-tab="${tab}Tab"]`).click();
  cy.wait(`@${apiCallAlias}`).then(() => {
    cy.log('All api requests have completed, ');
  });
}

Cypress.Commands.add('createReport' as keyof Chainable, () => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?createReport=Simple%20report',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
});

function createOtherReport() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Another%20simple%20report',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createOtherReport' as keyof Chainable, createOtherReport);

function createRunningReport() {
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Waiting%20for%20thread%20to%20start',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createRunningReport' as keyof Chainable,
  createRunningReport,
);

function createReportWithLabelNull() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Message%20is%20null',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createReportWithLabelNull' as keyof Chainable,
  createReportWithLabelNull,
);

function createReportWithLabelEmpty() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Message%20is%20an%20empty%20string',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createReportWithLabelEmpty' as keyof Chainable,
  createReportWithLabelEmpty,
);

function createReportWithInfopoint() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Hide%20a%20checkpoint%20in%20blackbox%20view',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createReportWithInfopoint' as keyof Chainable, createReportWithInfopoint);

function createReportWithMutipleStartpoints() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
    '/index.jsp?createReport=Multiple%20startpoints',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createReportWithMutipleStartpoints' as keyof Chainable, createReportWithMutipleStartpoints);

function clearDebugStore() {
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?clearDebugStorage=true',
  );
}

Cypress.Commands.add('clearDebugStore' as keyof Chainable, clearDebugStore);

function removeReportInProgress() {
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?removeReportInProgress=1',
  );
}

Cypress.Commands.add(
  'removeReportInProgress' as keyof Chainable,
  removeReportInProgress,
);

function waitForNumFiles(thePath: any, fileCount: number, timeLeft: number) {
  return cy.task('downloads', thePath).then((actualFiles: any) => {
    if (actualFiles.length >= fileCount) {
      return true;
    } else {
      cy.wait(1000);
      let nextTimeLeft = timeLeft - 1000;
      return nextTimeLeft <= 0
        ? false
        : waitForNumFiles(thePath, fileCount, nextTimeLeft);
    }
  });
}

Cypress.Commands.add(
  'waitForNumFiles' as keyof Chainable,
  (thePath: any, expectedNumFiles: number) => {
    waitForNumFiles(thePath, expectedNumFiles, 10_000);
  },
);

function getShownMonacoModelElement() {
  cy.get('[data-cy-test-editor="editor"] [data-keybinding-context]').within(
    (monacoEditor: JQuery<HTMLElement>) => {
      const keybindingNumber = Number.parseInt(
        monacoEditor.attr('data-keybinding-context'),
      );
      // Show the number
      cy.wrap(keybindingNumber);
      return cy.get(`[data-uri $= ${keybindingNumber}]`);
    },
  );
}

Cypress.Commands.add(
  'getShownMonacoModelElement' as keyof Chainable,
  getShownMonacoModelElement,
);

function selectIfNotSelected(node: unknown) {
  if (!node.hasClass('node-selected')) {
    cy.wrap(node).click();
  }
}

Cypress.Commands.add(
  'selectIfNotSelected' as keyof Chainable,
  { prevSubject: 'element' },
  (node) => selectIfNotSelected(node),
);

Cypress.Commands.add('enableShowMultipleInDebugTree' as keyof Chainable, () => {
  cy.get('[data-cy-debug="openSettings"]').click();
  cy.get('[data-cy-settings="showAmount"]').click();
  cy.get('[data-cy-settings="saveChanges"]').click();
});

//Clear reports in test tab if any present
Cypress.Commands.add('deleteAllTestReports' as keyof Chainable, () => {
  cy.navigateToTestTabAndWait();
  cy.get('[data-cy-test="table"]', { timeout: 5000 }).then((tbody: JQuery) => {
    if (tbody.find('tr').length > 0) {
      cy.get('[data-cy-test="selectAll"]').click();
      cy.get('[data-cy-test="deleteSelected"]').click();
      cy.get('[data-cy-delete-modal="confirm"]').click();
    }
  });
  cy.visit('');
});

Cypress.Commands.add('checkTableNumRows', n => {
  if (n === 0) {
    cy.get('[data-cy-debug="tableBody"]')
      .find('tr', { timeout: 10000 })
      .should('not.exist');
  } else {
    cy.get('[data-cy-debug="tableBody"]', { timeout: 10000 })
      .find('tr', { timeout: 10000 })
      .should('have.length', n);
  }
});

Cypress.Commands.add('checkTestTableNumRows', n => {
  cy.get('[data-cy-test="table"] tr', { timeout: 10000 }).should('have.length', n);
});

Cypress.Commands.add('checkTestTableReportsAre', reportNames => {
  cy.checkTestTableNumRows(reportNames.length);
  reportNames.forEach(reportName => {
    cy.get('[data-cy-test="table"]')
      .find('tr')
      .contains('/' + reportName)
      .should('have.length', 1);
  });
});

Cypress.Commands.add('debugTreeGuardedCopyReport', (reportName, numExpandedNodes, aliasSuffix) => {
  const alias = `debugTreeGuardedCopyReport_${aliasSuffix}`;
  cy.get(`[data-cy-debug-tree="root"] > app-tree-item .item-name:contains(${reportName})`).should('have.length', numExpandedNodes);
  cy.intercept({
    method: 'PUT',
    hostname: 'localhost',
    url: /\/api\/report\/store\/*?/g,
    times: 1,
  }).as(alias);
  cy.get('[data-cy-debug-editor="copy"]').click();
  cy.wait(`@${alias}`, {timeout: 10000}).then((res) => {
    cy.wrap(res).its('request.url').should('contain', 'Test');
    cy.wrap(res).its('request.body').as('requestBody');
    cy.get('@requestBody').its('Debug').should('have.length', 1);
    cy.wrap(res).its('response.statusCode').should('equal', 200);
    cy.log('Api call to copy report has been completed');
  });
});


Cypress.Commands.add('clickFirstFileInFileTree' as keyof Chainable, () => {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(0).find('app-tree-item').eq(0).click();
});

Cypress.Commands.add('clickRowInTable', (index: number) => {
  cy.get('[data-cy-debug="tableBody"]').find('tr').eq(index).click();
});

Cypress.Commands.add('checkFileTreeLength', (n: number) => {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').should('have.length', n);
});

Cypress.Commands.add('refreshApp', () => {
  cy.intercept({
    method: 'GET',
    hostname: 'localhost',
    url: /\/api\/*?/g,
  }).as('apiCall');
  cy.get('[data-cy-debug="refresh"]').click();
  cy.wait('@apiCall').then(() =>
    cy.log('All api requests have completed'),
  );
});

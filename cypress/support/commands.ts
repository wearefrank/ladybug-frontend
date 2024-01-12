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

function createReport() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?createReport=Simple%20report'
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createReport' as keyof Chainable, createReport);

function createOtherReport() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
      '/index.jsp?createReport=Another%20simple%20report'
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createOtherReport' as keyof Chainable, createOtherReport);

function createRunningReport() {
  cy.request(
    Cypress.env('backendServer') +
      '/index.jsp?createReport=Waiting%20for%20thread%20to%20start'
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createRunningReport' as keyof Chainable,
  createRunningReport
);

function createReportWithLabelNull() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?createReport=Message%20is%20null'
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createReportWithLabelNull' as keyof Chainable,
  createReportWithLabelNull
);

function createReportWithLabelEmpty() {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    Cypress.env('backendServer') +
      '/index.jsp?createReport=Message%20is%20an%20empty%20string'
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add(
  'createReportWithLabelEmpty' as keyof Chainable,
  createReportWithLabelEmpty
);

function clearDebugStore() {
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?clearDebugStorage=true'
  );
}

Cypress.Commands.add('clearDebugStore' as keyof Chainable, clearDebugStore);

function removeReportInProgress() {
  cy.request(
    Cypress.env('backendServer') + '/index.jsp?removeReportInProgress=1'
  );
}

Cypress.Commands.add(
  'removeReportInProgress' as keyof Chainable,
  removeReportInProgress
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
  }
);

function getShownMonacoModelElement() {
  cy.get('#editor [data-keybinding-context]').within(
    (monacoEditor: JQuery<HTMLElement>) => {
      const keybindingNumber = Number.parseInt(
        monacoEditor.attr('data-keybinding-context')
      );
      // Show the number
      cy.wrap(keybindingNumber);
      return cy.get(`[data-uri $= ${keybindingNumber}]`);
    }
  );
}

Cypress.Commands.add(
  'getShownMonacoModelElement' as keyof Chainable,
  getShownMonacoModelElement
);

function selectIfNotSelected(node: unknown) {
  if (!node.hasClass('node-selected')) {
    cy.wrap(node).click();
  }
}

Cypress.Commands.add(
  'selectIfNotSelected' as keyof Chainable,
  { prevSubject: 'element' },
  (node) => selectIfNotSelected(node)
);

function enableShowMultiple() {
  cy.get('[data-cy-record-table-index="0"]').click();
  cy.get('input[data-cy-toggle-show-amount]').click();
  cy.get('button#CloseAllButton').click();
}

Cypress.Commands.add(
  'enableShowMultipleInDebugTree' as keyof Chainable,
  enableShowMultiple
);

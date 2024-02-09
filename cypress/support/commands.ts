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
    Cypress.env('backendServer') + '/index.jsp?createReport=Simple%20report',
  ).then((resp) => {
    expect(resp.status).equal(200);
  });
}

Cypress.Commands.add('createReport' as keyof Chainable, createReport);

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
  cy.get("[data-cy-test-editor='editor'] [data-keybinding-context]").within(
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
  cy.get("[data-cy-debug='openSettings']").click();
  cy.get("[data-cy-settings='showAmount']").click();
  cy.get("[data-cy-settings='saveChanges']").click();
});

//Clear reports in test tab if any present
Cypress.Commands.add('deleteAllTestReports' as keyof Chainable, () => {
  cy.visit('');
  cy.get('[data-cy-nav-tab="testTab"]').click();
  cy.wait(2000);
  cy.get("[data-cy-test='selectAll']").click();
  cy.get("[data-cy-test='deleteSelected']").click();
  console.log(Cypress.$("[data-cy-delete-modal='confirm']"));
  if (Cypress.$("[data-cy-delete-modal='confirm']").length > 0) {
    cy.get("[data-cy-delete-modal='confirm']").should('exist');
  }
  cy.visit('');
});

Cypress.Commands.add('checkTableNumRows', n => {
  if(n === 0) {
    cy.get("[data-cy-debug='tableBody']")
      .find("tr", { timeout: 10000 })
      .should("not.exist");
  } else {
    cy.get("[data-cy-debug='tableBody']", { timeout: 10000 })
      .find("tr", { timeout: 10000 })
      .should("have.length", n);
  }
})

Cypress.Commands.add('checkTestTableNumRows', n => {
  cy.get("[data-cy-test='table'] tr", { timeout: 10000 }).should("have.length", n);
})

Cypress.Commands.add('checkTestTableReportsAre', reportNames => {
  cy.checkTestTableNumRows(reportNames.length);
  reportNames.forEach(reportName => {
    cy.get("[data-cy-test='table']")
    .find("tr")
    .contains("/" + reportName)
    .should("have.length", 1);
  })
})
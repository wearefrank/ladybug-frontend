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
import JQueryWithSelector = Cypress.JQueryWithSelector;
import { Interception } from 'cypress/types/net-stubbing';

declare global {
  namespace Cypress {
    interface Chainable {
      initializeApp(): Chainable;
      resetApp(): Chainable;
      clearTestReports(): Chainable;
      navigateToTestTabAndWait(): Chainable;
      navigateToDebugTabAndWait(): Chainable;
      createReport(): Chainable;
      createOtherReport(): Chainable;
      createRunningReport(): Chainable;
      createReportWithLabelNull(): Chainable;
      createReportWithLabelEmpty(): Chainable;
      createReportWithInfopoint(): Chainable;
      createReportWithMultipleStartpoints(): Chainable;
      clearDebugStore(): Chainable;
      clearReportsInProgress(): Chainable;
      selectIfNotSelected(): Chainable;
      enableShowMultipleInDebugTree(): Chainable;
      checkTestTableNumRows(length: number): Chainable;
      checkTestTableReportsAre(reportNames: string[]): Chainable;
      debugTreeGuardedCopyReport(reportName: string, numExpandedNodes: number, aliasSuffix: string): Chainable;
      clickFirstFileInFileTree(): Chainable;
      clickRowInTable(index: number): Chainable;
      checkFileTreeLength(length: number): Chainable;
      refreshApp(): Chainable;
      assertDebugTableLength(length: number): Chainable;
      getTableRows(): Chainable;
    }
  }
}

Cypress.Commands.add('initializeApp' as keyof Chainable, (): void => {
  //Custom command to initialize app and wait for all api requests
  interceptGetApiCall('apiCall');
  cy.visit('');
  cy.wait('@apiCall').then(() => cy.log('All api requests have completed'));
});

Cypress.Commands.add('resetApp' as keyof Chainable, (): void => {
  cy.clearDebugStore();
  cy.clearTestReports();
  cy.clearReportsInProgress();
  cy.initializeApp();
});

Cypress.Commands.add('clearTestReports' as keyof Chainable, (): void => {
  cy.request({ method: 'DELETE', url: '/api/report/all/Test' }).then((resp: Cypress.Response<ApiResponse>) => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('navigateToTestTabAndWait' as keyof Chainable, (): void => {
  navigateToTabAndWait('test');
});

Cypress.Commands.add('navigateToDebugTabAndWait' as keyof Chainable, (): void => {
  navigateToTabAndWait('debug');
});

Cypress.Commands.add('createReport' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Simple%20report`).then((resp: Cypress.Response<ApiResponse>) => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('createOtherReport' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Another%20simple%20report`).then((resp: Cypress.Response<ApiResponse>) => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('createRunningReport' as keyof Chainable, (): void => {
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Waiting%20for%20thread%20to%20start`).then(
    (resp: Cypress.Response<ApiResponse>): void => {
      expect(resp.status).equal(200);
    },
  );
});

Cypress.Commands.add('createReportWithLabelNull' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Message%20is%20null`).then((resp: Cypress.Response<ApiResponse>) => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('createReportWithLabelEmpty' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Message%20is%20an%20empty%20string`).then(
    (resp: Cypress.Response<ApiResponse>): void => {
      expect(resp.status).equal(200);
    },
  );
});

Cypress.Commands.add('createReportWithInfopoint' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(
    `${Cypress.env('backendServer')}/index.jsp?createReport=Hide%20a%20checkpoint%20in%20blackbox%20view`,
  ).then((resp: Cypress.Response<ApiResponse>): void => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('createReportWithMultipleStartpoints' as keyof Chainable, (): void => {
  // No cy.visit because then the API call can happen multiple times.
  cy.request(`${Cypress.env('backendServer')}/index.jsp?createReport=Multiple%20startpoints`).then((resp: Cypress.Response<ApiResponse>): void => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('clearDebugStore' as keyof Chainable, (): void => {
  cy.request(`${Cypress.env('backendServer')}/index.jsp?clearDebugStorage=true`).then((resp: Cypress.Response<ApiResponse>): void => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('clearReportsInProgress' as keyof Chainable, (): void => {
  cy.request(`${Cypress.env('backendServer')}/index.jsp?removeReportsInProgress`).then((resp: Cypress.Response<ApiResponse>): void => {
    expect(resp.status).equal(200);
  });
});

Cypress.Commands.add('selectIfNotSelected' as keyof Chainable, { prevSubject: 'element' }, (node: JQueryWithSelector<HTMLElement>): void => {
  if (!node[0].classList.contains("selected")) {
    cy.wrap(node).click()
  }
});

Cypress.Commands.add('enableShowMultipleInDebugTree' as keyof Chainable, (): void => {
  cy.get('[data-cy-debug="openSettings"]').click();
  cy.get('[data-cy-settings="showAmount"]').click();
  cy.get('[data-cy-settings="saveChanges"]').click();
});

Cypress.Commands.add('checkTestTableNumRows' as keyof Chainable, (length: number): void => {
  cy.get('[data-cy-test="table"] tr').should('have.length', length);
});

Cypress.Commands.add('checkTestTableReportsAre' as keyof Chainable, (reportNames: string[]): void => {
  cy.checkTestTableNumRows(reportNames.length);
  for (const reportName of reportNames) {
    cy.get('[data-cy-test="table"]').find('tr').contains(`/${reportName}`).should('have.length', 1);
  }
});

Cypress.Commands.add('debugTreeGuardedCopyReport' as keyof Chainable, (reportName: string, numExpandedNodes: number, aliasSuffix: string): void => {
  const alias = `debugTreeGuardedCopyReport_${aliasSuffix}`;
  cy.get('[data-cy-debug-tree="root"]')
    .find(`app-tree-item .item-name:contains(${reportName})`)
    .should('have.length', numExpandedNodes);
  cy.intercept({
    method: 'PUT',
    hostname: 'localhost',
    url: /\/api\/report\/store\/*?/g,
    times: 1,
  }).as(alias);
  cy.get('[data-cy-debug-editor="copy"]').click();
  cy.wait(`@${alias}`).then((res: Interception): void => {
    cy.wrap(res).its('request.url').should('contain', 'Test');
    cy.wrap(res).its('request.body').as('requestBody');
    cy.get('@requestBody').its('Debug').should('have.length', 1);
    cy.wrap(res).its('response.statusCode').should('equal', 200);
    cy.log('Api call to copy report has been completed');
  });
});

Cypress.Commands.add('clickFirstFileInFileTree' as keyof Chainable, (): void => {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').eq(0).find('app-tree-item').eq(0).click();
});

Cypress.Commands.add('clickRowInTable' as keyof Chainable, (index: number): void => {
  cy.getTableRows().eq(index).click();
});

Cypress.Commands.add('checkFileTreeLength' as keyof Chainable, (length: number): void => {
  cy.get('[data-cy-debug-tree="root"] > app-tree-item').should('have.length', length);
});

Cypress.Commands.add('refreshApp' as keyof Chainable, (): void => {
  interceptGetApiCall('apiCall');
  cy.get('[data-cy-debug="refresh"]').click();
  cy.wait('@apiCall').then(() => cy.log('All api requests have completed'));
});

Cypress.Commands.add('getTableRows' as keyof Chainable, (): Chainable => {
  return cy.get('[data-cy-debug="tableRow"]');
});

Cypress.Commands.add('assertDebugTableLength' as keyof Chainable, (length: number): void => {
  length === 0
    ? cy.getTableRows().should('not.exist')
    : cy.getTableRows().should('have.length', length);
});

function interceptGetApiCall(alias: string): void {
  cy.intercept({
    method: 'GET',
    hostname: 'localhost',
    url: /\/api\/*?/g,
  }).as(alias);
}

//More string values can be added for each tab that can be opened
function navigateToTabAndWait(tab: 'debug' | 'test'): void {
  const apiCallAlias: string = `apiCall${tab}Tab`;
  interceptGetApiCall(apiCallAlias);
  cy.visit('');
  cy.get(`[data-cy-nav-tab="${tab}Tab"]`).click();
  cy.wait(`@${apiCallAlias}`).then(() => {
    cy.log('All api requests have completed, ');
  });
}

interface ApiResponse {
  status: boolean;
}

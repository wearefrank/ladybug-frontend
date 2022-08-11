// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { createJSDocTypeExpression, createYield } from "typescript";
import 'cypress-file-upload';
import { cpSync } from "fs";

function createReport() {
    // No cy.visit because then the API call can happen multiple times.
    cy.request(Cypress.env('backendServer') + '/index.jsp?createReport=Simple%20report').then(resp => {
        expect(resp.status).equal(200);
    });
}

Cypress.Commands.add('createReport', createReport);

function createOtherReport() {
    // No cy.visit because then the API call can happen multiple times.
    cy.request(Cypress.env('backendServer') + '/index.jsp?createReport=Another%20simple%20report').then(resp => {
        expect(resp.status).equal(200);
    });
}

Cypress.Commands.add('createOtherReport', createOtherReport);

function createRunningReport() {
    cy.request(Cypress.env('backendServer') + '/index.jsp?createReport=Waiting%20for%20thread%20to%20start').then(resp => {
        expect(resp.status).equal(200);
    });
}

Cypress.Commands.add('createRunningReport', createRunningReport);

function createReportWithLabelNull() {
    // No cy.visit because then the API call can happen multiple times.
    cy.request(Cypress.env('backendServer') + '/index.jsp?createReport=Message%20is%20null').then(resp => {
        expect(resp.status).equal(200);
    });
}

Cypress.Commands.add('createReportWithLabelNull', createReportWithLabelNull);

function createReportWithLabelEmpty() {
    // No cy.visit because then the API call can happen multiple times.
    cy.request(Cypress.env('backendServer') + '/index.jsp?createReport=Message%20is%20an%20empty%20string').then(resp => {
        expect(resp.status).equal(200);
    });
}

Cypress.Commands.add('createReportWithLabelEmpty', createReportWithLabelEmpty);

function clearDebugStore() {
    cy.request(Cypress.env('backendServer') + '/index.jsp?clearDebugStorage=true');
}

Cypress.Commands.add('clearDebugStore', clearDebugStore);

function removeReportInProgress() {
    cy.request(Cypress.env('backendServer') + '/index.jsp?removeReportInProgress=1');
}

Cypress.Commands.add('removeReportInProgress', removeReportInProgress);

function waitForNumFiles(thePath, fileCount, timeLeft) {
    cy.task('downloads', thePath).then((actualFiles) => {
        if(actualFiles.length >= fileCount) {
            return true;
        } else {
            cy.wait(1000);
            let nextTimeLeft = timeLeft - 1000;
            if(nextTimeLeft <= 0) {
                return false;
            } else {
                return waitForNumFiles(thePath, fileCount, nextTimeLeft);
            }
        }
    })
};

Cypress.Commands.add('waitForNumFiles', (thePath, expectedNumFiles) => waitForNumFiles(thePath, expectedNumFiles, 10000));

function getShownMonacoModelElement() {
    cy.get('#monacoEditor [data-keybinding-context]').within(function($monacoEditor) {
        const keybindingNumber = parseInt($monacoEditor.attr('data-keybinding-context'));
        // Show the number
        cy.wrap(keybindingNumber);
        return cy.get(`[data-uri $= ${keybindingNumber}]`);
    });
};

Cypress.Commands.add('getShownMonacoModelElement', getShownMonacoModelElement);

function selectIfNotSelected(node) {
    if(! node.hasClass('node-selected')) {
        cy.wrap(node).click();
    }
};

Cypress.Commands.add('selectIfNotSelected', {prevSubject: 'element'}, (node) => selectIfNotSelected(node));

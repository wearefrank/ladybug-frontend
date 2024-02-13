cy.functions = {
    downloadPath: (theFile) => {
        return Cypress.config('downloadsFolder') + Cypress.env('FILESEP') + theFile;
    },

  testTabDeselectReportNamed: (nameToSelect) => {
        cy.get("[data-cy-test='table']").find('tr').each(function($reportRow) {
            cy.log('Considering next report');
            const reportName = $reportRow.find('td').eq(2).text();
            cy.log('Name of report is: ' + reportName);
            if(reportName.includes(nameToSelect)) {
                cy.log('Found checkbox of report with name name, checking it');
                cy.wrap($reportRow).find("[type=checkbox]").uncheck();
            };
            cy.get("[data-cy-test='reportChecked']:checked").should('have.length', 1);
            cy.wait(1000);
        });
    }
}

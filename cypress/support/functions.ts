cy.functions = {
    downloadPath: (theFile) => {
        return Cypress.config('downloadsFolder') + Cypress.env('FILESEP') + theFile;
    },

    testTabSelectReportNamed: (nameToSelect) => {
        cy.get('#testReports').find('tr').each(function($reportRow) {
            cy.log('Considering next report');
            const reportName = $reportRow.find('td').eq(2).text();
            cy.log('Name of report is: ' + reportName);
            if(reportName.includes(nameToSelect)) {
                cy.log('Found checkbox of report with name name, checking it');
                cy.wrap($reportRow).find('[type=checkbox]').check();
            };
            cy.get('#testReports tr [type=checkbox]:checked').should('have.length', 1);
            cy.wait(1000);
        });
    }
}

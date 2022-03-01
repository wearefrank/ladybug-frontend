cy.functions = {
    downloadPath: (theFile) => {
        return Cypress.config('downloadsFolder') + Cypress.env('FILESEP') + theFile;
    }
}
describe('Tests for settings component', () => {
  beforeEach(() => {
    cy.visit('');
    cy.createReport();
  });

  it('should alter spacing when spacing setting is altered', () => {
    cy.get('[data-cy-open-settings-modal]').as('openSettingsModal').click();
    cy.get('[data-cy-spacing-dropdown-input]').select('1x');
    cy.get('[data-cy-spacing-dropdown-input] option:selected').should(
      'have.text',
      '1x '
    );
    cy.get('[data-cy-settings-modal-save-changes]').as('saveButton').click();
    cy.get('[data-cy-record-table-index="0"]')
      .find('td')
      .first()
      .as('tableCell');
    cy.get('@tableCell').should('have.attr', 'style', 'padding: 0.25em 0px;');
    cy.get('@openSettingsModal').click();
    cy.get('[data-cy-spacing-dropdown-input]').select('0x');
    cy.get('[data-cy-spacing-dropdown-input] option:selected').should(
      'have.text',
      '0x '
    );
    cy.get('@saveButton').click();
    cy.get('@tableCell').should('have.attr', 'style', 'padding: 0em 0px;');
  });

  it('should allow multiple files to be opened in debug tree when setting is enabled and close all but one report when setting is disabled', () => {
    cy.createReport();
    cy.get('[data-cy-open-settings-modal]').as('openSettingsModal').click();
    cy.get('[data-cy-toggle-show-amount]').should(
      'have.attr',
      'value',
      'false'
    );
    cy.get('[data-cy-close-settings-modal]').click();
    cy.get('[data-cy-record-table-index="0"]').click();
    cy.get('[data-cy-record-table-index="1"]').click();
    cy.get('#debug-tree .jqx-tree-dropdown-root > li').should(
      'have.length',
      '1'
    );
    cy.get('@openSettingsModal').click();
    cy.get('[data-cy-toggle-show-amount]').click();
    cy.get('[data-cy-toggle-show-amount]').should('have.attr', 'value', 'true');
    cy.get('[data-cy-close-settings-modal]').click();
    cy.get('[data-cy-record-table-index="0"]').click();
    cy.get('#debug-tree .jqx-tree-dropdown-root > li').should(
      'have.length',
      '2'
    );
    cy.get('[data-cy-open-settings-modal]').as('openSettingsModal').click();
    cy.get('[data-cy-toggle-show-amount]').click();
    cy.get('[data-cy-close-settings-modal]').click();
    cy.get('#debug-tree .jqx-tree-dropdown-root > li').should(
      'have.length',
      '1'
    );
  });
});

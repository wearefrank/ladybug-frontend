import { defineConfig } from 'cypress'

export default defineConfig({
  trashAssetsBeforeRuns: false,
  env: {
    backendServer: 'http://localhost:80',
    FILESEP: '\\',
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:4200',
    excludeSpecPattern: [
      '**/cypress/integration/1-getting-started/**',
      '**/cypress/integration/2-advanced-examples/**',
    ],
  },
})

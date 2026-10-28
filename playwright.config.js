require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./global-setup.js'),
  timeout: 160000,
  reporter: [['list'], ['html', { open: 'never' }], ['./reporters/orderSummaryReporter.js'], ['./reporters/loginSummaryReporter.js']],
  use: {
    baseURL: process.env.AZBU_URL,
    permissions: ['local-network-access'],
    screenshot: 'on',
    video: 'on',
    trace: 'on',
    viewport: null,
    launchOptions: {
      slowMo: Number(process.env.SLOW_MO ?? 0),
      args: ['--start-maximized'],
    },
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'azbu',
      testMatch: /.*\.spec\.js/,
      dependencies: ['setup'],
      use: { storageState: 'auth/azbu.json' },
    },
  ],
});

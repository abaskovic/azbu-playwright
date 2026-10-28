const readline = require('readline');

const ALIASES = { p: 'prod', prod: 'prod', t: 'test', test: 'test', u: 'test', uat: 'test', d: 'dev', dev: 'dev' };

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

module.exports = async function globalSetup() {
  if (process.env.AZBU_ENV_SELECTED) return;
  const testUrl = process.env.AZBU_URL;
  if (!testUrl) throw new Error('AZBU_URL is not set in .env');
  let env = ALIASES[String(process.env.AZBU_ENV ?? '').toLowerCase()];
  while (!env) {
    if (!process.stdin.isTTY) throw new Error('Set AZBU_ENV=prod|test|dev when running without a terminal');
    env = ALIASES[(await ask('Environment? [p]rod / [t]est (uat) / [d]ev: ')).trim().toLowerCase()];
  }
  if (env === 'prod' && !process.env.AZBU_URL_PROD) throw new Error('AZBU_URL_PROD is not set in .env');
  const urls = { prod: process.env.AZBU_URL_PROD, test: testUrl, dev: testUrl.replace('ft_azbu_uat', 'ft_azbu_dev') };
  process.env.AZBU_URL = urls[env];
  process.env.AZBU_ENV_SELECTED = env;
  console.log(`Running against ${env.toUpperCase()}: ${urls[env]}\n`);
};

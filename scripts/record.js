require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { spawn } = require('child_process');

const child = spawn(
  'npx',
  ['playwright', 'codegen', '--viewport-size=1680,900', '--load-storage=auth/azbu.json', process.env.AZBU_URL],
  { stdio: 'inherit', shell: true },
);

child.on('exit', (code) => process.exit(code ?? 1));

const { spawn } = require('child_process');

const total = Math.max(1, parseInt(process.argv[2], 10) || 10);
const workers = Math.max(1, parseInt(process.argv[3], 10) || Math.min(total, 10));
const repeat = Math.ceil(total / 2);

console.log(`Running ${repeat * 2} sales orders (${repeat} x company + ${repeat} x person) with ${workers} workers`);

const child = spawn(
  'npx',
  ['playwright', 'test', '--project=azbu', '--no-deps', `--workers=${workers}`, '--fully-parallel', `--repeat-each=${repeat}`, 'tests/sales-order.spec.js'],
  { stdio: 'inherit', shell: true },
);

child.on('exit', (code) => process.exit(code ?? 1));

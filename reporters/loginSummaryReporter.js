function note(test, type) {
  return test.annotations.find((a) => a.type === type)?.description;
}

class LoginSummaryReporter {
  constructor() {
    this.rows = [];
  }

  onTestEnd(test) {
    const user = note(test, 'login user');
    if (!user) return;
    this.rows.push({
      user,
      expected: note(test, 'login expected'),
      result: note(test, 'login result') ?? 'error',
      time: note(test, 'login time') ?? '-',
      reason: note(test, 'login reason'),
    });
  }

  onEnd() {
    if (this.rows.length === 0) return;
    const line = '='.repeat(78);
    console.log(`\n${line}\nLOGIN SUMMARY\n${line}`);
    this.rows.forEach((row) => {
      const outcome = row.result === 'success' ? 'LOGIN OK' : 'LOGIN FAILED';
      const match = row.result === row.expected ? 'as expected' : `UNEXPECTED (expected ${row.expected})`;
      console.log(`${outcome.padEnd(13)} ${row.user.padEnd(30)} ${row.time.padStart(6)}  ${match}`);
      if (row.reason) console.log(`              Reason: ${row.reason}`);
    });
    console.log(`${line}\n`);
  }
}

module.exports = LoginSummaryReporter;

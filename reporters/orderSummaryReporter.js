function note(test, type) {
  return test.annotations.filter((a) => a.type === type).map((a) => a.description);
}

function formatDuration(ms) {
  const total = Math.round(ms / 1000);
  return `${Math.floor(total / 60)}m ${String(total % 60).padStart(2, '0')}s`;
}

class OrderSummaryReporter {
  constructor() {
    this.rows = [];
  }

  onTestEnd(test, result) {
    const [branch] = note(test, 'branch');
    if (!branch) return;
    const [items = ''] = note(test, 'items');
    const [orderNumber] = note(test, 'order number');
    const error = result.error?.message?.split('\n').find((line) => line.trim()) ?? '';
    this.rows.push({
      status: result.status,
      title: test.title,
      duration: result.duration,
      branch,
      user: note(test, 'user')[0],
      customer: note(test, 'customer account')[0],
      items,
      itemCount: items ? items.split(', ').length : 0,
      orderNumber,
      invoice: note(test, 'invoice')[0],
      retries: note(test, 'retry'),
      banners: note(test, 'banner'),
      error: result.status === 'passed' ? '' : error.replace(/\u001b\[[0-9;]*m/g, '').slice(0, 160),
    });
  }

  onEnd() {
    if (this.rows.length === 0) return;
    const passed = this.rows.filter((row) => row.status === 'passed');
    const failed = this.rows.length - passed.length;
    const line = '='.repeat(78);
    console.log(`\n${line}\nSALES ORDER SUMMARY: ${passed.length} passed, ${failed} failed, ${this.rows.length} total\n${line}`);
    this.rows.forEach((row, index) => {
      const mark = row.status === 'passed' ? 'PASS' : 'FAIL';
      console.log(`${String(index + 1).padStart(2)}. [${mark}] ${row.title}`);
      console.log(`    User: ${row.user ?? '-'} | Branch: ${row.branch} | Customer: ${row.customer} | Time: ${formatDuration(row.duration)}`);
      console.log(`    Items (${row.itemCount}): ${row.items}`);
      console.log(`    Order number: ${row.orderNumber ?? '-'} | Invoice: ${row.invoice ?? '-'}`);
      if (row.retries.length) console.log(`    Retries: ${row.retries.join(', ')}`);
      if (row.banners.length) console.log(`    Banners: ${row.banners.join(', ')}`);
      if (row.error) console.log(`    Error: ${row.error}`);
    });
    const orders = passed.filter((row) => row.orderNumber).map((row) => row.orderNumber);
    if (orders.length) console.log(`\nCreated orders: ${orders.join(', ')}`);
    const total = this.rows.reduce((sum, row) => sum + row.duration, 0);
    console.log(`Total test time: ${formatDuration(total)}\n${line}\n`);
  }
}

module.exports = OrderSummaryReporter;

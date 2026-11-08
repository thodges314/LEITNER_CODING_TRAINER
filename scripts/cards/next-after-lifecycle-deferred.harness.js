(async function () {
  const receiptCalls: Array<{ email: string; orderId: string }> = [];
  const auditCalls: Array<{ timestamp: number; action: string; orderId: string; status: string }> = [];
  let shouldFailOrder = false;

  (globalThis as any).processOrder = async function (order: { orderId: string; customerEmail: string; amount: number }) {
    if (shouldFailOrder) {
      throw new Error('Database transaction timeout');
    }
    return {
      id: order.orderId,
      status: 'confirmed' as const,
      total: order.amount,
    };
  };

  (globalThis as any).sendOrderReceipt = async function (email: string, orderId: string) {
    receiptCalls.push({ email, orderId });
  };

  (globalThis as any).recordAuditLog = async function (entry: { timestamp: number; action: string; orderId: string; status: string }) {
    auditCalls.push(entry);
  };

  const handler = typeof POST === 'function' ? POST : (globalThis as any).POST;
  if (typeof handler !== 'function') {
    throw new Error('POST function is not defined');
  }

  // Case 1: Valid order returns 201 immediately; after() tasks run asynchronously upon flush
  receiptCalls.length = 0;
  auditCalls.length = 0;
  shouldFailOrder = false;
  if (typeof resetAfterTasks === 'function') resetAfterTasks();

  const req1 = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-101',
      customerEmail: 'alex@example.com',
      amount: 149.99,
    }),
  });

  const res1 = await handler(req1);
  const data1 = await res1.json();

  $test.check(
    'Valid order returns HTTP 201 and confirmation payload immediately',
    res1.status === 201 && data1.success === true && data1.orderId === 'ord-101'
  );
  $test.check(
    'after() tasks do not execute synchronously before response return',
    receiptCalls.length === 0 && auditCalls.length === 0
  );

  if (typeof flushAfterTasks === 'function') {
    await flushAfterTasks();
  }

  $test.check(
    'sendOrderReceipt and recordAuditLog execute upon flushing after() queue',
    receiptCalls.length === 1 &&
      receiptCalls[0].email === 'alex@example.com' &&
      receiptCalls[0].orderId === 'ord-101' &&
      auditCalls.length === 1 &&
      auditCalls[0].action === 'order_processed' &&
      auditCalls[0].orderId === 'ord-101'
  );

  // Case 2: Invalid body returns 400 and does NOT schedule after() tasks
  receiptCalls.length = 0;
  auditCalls.length = 0;
  if (typeof resetAfterTasks === 'function') resetAfterTasks();

  const req2 = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-102',
      customerEmail: 'not-an-email',
      amount: -10,
    }),
  });

  const res2 = await handler(req2);
  const data2 = await res2.json();

  $test.check(
    'Invalid payload returns 400 with error message',
    res2.status === 400 && data2.error === 'Invalid order payload'
  );
  if (typeof flushAfterTasks === 'function') await flushAfterTasks();
  $test.check(
    'No after() tasks executed on invalid payload',
    receiptCalls.length === 0 && auditCalls.length === 0
  );

  // Case 3: Failed processOrder returns 500 and does NOT schedule after() tasks
  receiptCalls.length = 0;
  auditCalls.length = 0;
  shouldFailOrder = true;
  if (typeof resetAfterTasks === 'function') resetAfterTasks();

  const req3 = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-103',
      customerEmail: 'taylor@example.com',
      amount: 45.0,
    }),
  });

  const res3 = await handler(req3);
  const data3 = await res3.json();

  $test.check(
    'Failed order processing returns 500 without scheduling after() tasks',
    res3.status === 500 && data3.error === 'Order processing failed'
  );
  if (typeof flushAfterTasks === 'function') await flushAfterTasks();
  $test.check(
    'No after() tasks executed when order processing throws',
    receiptCalls.length === 0 && auditCalls.length === 0
  );

  // Case 4: Sequential orders queue independent after() callbacks
  receiptCalls.length = 0;
  auditCalls.length = 0;
  shouldFailOrder = false;
  if (typeof resetAfterTasks === 'function') resetAfterTasks();

  const req4A = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-201',
      customerEmail: 'sam@example.com',
      amount: 89.0,
    }),
  });

  const req4B = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'ord-202',
      customerEmail: 'jordan@example.com',
      amount: 199.5,
    }),
  });

  const res4A = await handler(req4A);
  const res4B = await handler(req4B);

  $test.check('Sequential orders return 201 before task flush', res4A.status === 201 && res4B.status === 201);
  $test.check('Tasks remain pending until flush is triggered', receiptCalls.length === 0);

  if (typeof flushAfterTasks === 'function') await flushAfterTasks();

  $test.check(
    'Flushing executes all independent after() callbacks in order',
    receiptCalls.length === 2 &&
      auditCalls.length === 2 &&
      receiptCalls.map((r: { email: string }) => r.email).includes('sam@example.com') &&
      receiptCalls.map((r: { email: string }) => r.email).includes('jordan@example.com')
  );
})();

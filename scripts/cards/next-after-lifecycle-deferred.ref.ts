interface OrderPayload {
  orderId: string;
  customerEmail: string;
  amount: number;
}

interface ProcessedOrderResult {
  id: string;
  status: 'confirmed' | 'pending';
  total: number;
}

interface AuditLogRecord {
  timestamp: number;
  action: string;
  orderId: string;
  status: 'success' | 'failed';
}

declare function processOrder(order: OrderPayload): Promise<ProcessedOrderResult>;
declare function sendOrderReceipt(email: string, orderId: string): Promise<void>;
declare function recordAuditLog(entry: AuditLogRecord): Promise<void>;
declare function after(task: (() => void | Promise<void>) | Promise<any>): void;

async function POST(request: Request): Promise<NextResponse> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  if (
    !body ||
    typeof body.orderId !== 'string' ||
    !body.orderId.trim() ||
    typeof body.customerEmail !== 'string' ||
    !body.customerEmail.includes('@') ||
    typeof body.amount !== 'number' ||
    body.amount <= 0 ||
    isNaN(body.amount)
  ) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  let result: ProcessedOrderResult;
  try {
    result = await processOrder({
      orderId: body.orderId,
      customerEmail: body.customerEmail,
      amount: body.amount,
    });
  } catch {
    return NextResponse.json({ error: 'Order processing failed' }, { status: 500 });
  }

  after(async () => {
    try {
      await sendOrderReceipt(body.customerEmail, result.id);
      await recordAuditLog({
        timestamp: Date.now(),
        action: 'order_processed',
        orderId: result.id,
        status: 'success',
      });
    } catch {
      // Background task failures are isolated from the response
    }
  });

  return NextResponse.json(
    {
      success: true,
      orderId: result.id,
      status: result.status,
    },
    { status: 201 }
  );
}


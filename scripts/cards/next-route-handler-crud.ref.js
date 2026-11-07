interface RouteContext {
  params: { id: string };
}

interface ItemRecord {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface CreateItemInput {
  name: string;
  quantity: number;
  price: number;
}

const itemsStore = new Map<string, ItemRecord>();

const GET = async (request: Request, context: RouteContext): Promise<NextResponse> => {
  const id = context?.params?.id;
  const item = itemsStore.get(id);

  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json(item, { status: 200 });
};

const POST = async (request: Request, context: RouteContext): Promise<NextResponse> => {
  const id = context?.params?.id;
  let body: Partial<CreateItemInput> | undefined;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid item payload' }, { status: 400 });
  }

  const name = body?.name;
  const quantity = body?.quantity;
  const price = body?.price;

  const isValidName = typeof name === 'string' && name.trim().length > 0;
  const isValidQuantity = typeof quantity === 'number' && Number.isFinite(quantity) && quantity >= 0;
  const isValidPrice = typeof price === 'number' && Number.isFinite(price) && price >= 0;

  if (!isValidName || !isValidQuantity || !isValidPrice) {
    return NextResponse.json({ error: 'Invalid item payload' }, { status: 400 });
  }

  const record: ItemRecord = {
    id,
    name: name.trim(),
    quantity,
    price,
  };

  itemsStore.set(id, record);

  return NextResponse.json(record, { status: 201 });
};


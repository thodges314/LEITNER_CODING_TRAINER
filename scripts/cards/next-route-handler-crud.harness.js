await (async () => {
  const getFn = typeof GET === 'function' ? GET : (typeof solution === 'object' && solution?.GET);
  const postFn = typeof POST === 'function' ? POST : (typeof solution === 'object' && solution?.POST);

  if (typeof itemsStore !== 'undefined' && itemsStore?.clear) {
    itemsStore.clear();
  }

  // Case 1: GET unknown item returns 404
  const req404 = new Request('http://localhost:3000/api/items/unknown_999');
  const res404 = await getFn(req404, { params: { id: 'unknown_999' } });
  const data404 = await res404.json();
  $test.check(
    'GET returns 404 with error when item does not exist',
    res404.status === 404 && data404?.error === 'Item not found',
    { status: res404.status, data: data404 }
  );

  // Case 2: POST invalid payload returns 400
  const req400 = new Request('http://localhost:3000/api/items/item_1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '', quantity: -5, price: 10 }),
  });
  const res400 = await postFn(req400, { params: { id: 'item_1' } });
  const data400 = await res400.json();
  $test.check(
    'POST returns 400 with error when payload is invalid',
    res400.status === 400 && data400?.error === 'Invalid item payload',
    { status: res400.status, data: data400 }
  );

  // Case 3: POST valid payload returns 201 with created record
  const req201 = new Request('http://localhost:3000/api/items/item_1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Mechanical Keyboard', quantity: 15, price: 120 }),
  });
  const res201 = await postFn(req201, { params: { id: 'item_1' } });
  const data201 = await res201.json();
  $test.check(
    'POST returns 201 with saved item record on valid payload',
    res201.status === 201 &&
      data201?.id === 'item_1' &&
      data201?.name === 'Mechanical Keyboard' &&
      data201?.quantity === 15 &&
      data201?.price === 120,
    { status: res201.status, data: data201 }
  );

  // Case 4: GET existing item returns 200 with matching record
  const req200 = new Request('http://localhost:3000/api/items/item_1');
  const res200 = await getFn(req200, { params: { id: 'item_1' } });
  const data200 = await res200.json();
  $test.check(
    'GET returns 200 with matching item record for existing item',
    res200.status === 200 &&
      data200?.id === 'item_1' &&
      data200?.name === 'Mechanical Keyboard' &&
      data200?.quantity === 15 &&
      data200?.price === 120,
    { status: res200.status, data: data200 }
  );
})();


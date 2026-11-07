await (async () => {
  const fn = typeof updateCartQuantity === 'function' ? updateCartQuantity : solution;

  const initialState = { success: false };

  // Case 1: Valid formData returns success: true with cart details
  const fd1 = new FormData();
  fd1.set('itemId', 'item_42');
  fd1.set('quantity', '3');
  const r1 = await fn(initialState, fd1);
  $test.check(
    'Valid formData returns success: true with updated cart and computed total',
    r1?.success === true &&
      r1?.cart?.itemId === 'item_42' &&
      r1?.cart?.quantity === 3 &&
      r1?.cart?.total === 75 &&
      !r1?.errors,
    r1
  );

  // Case 2: Missing itemId returns errors.itemId
  const fd2 = new FormData();
  fd2.set('quantity', '2');
  const r2 = await fn(initialState, fd2);
  $test.check(
    'Missing itemId returns success: false with errors.itemId',
    r2?.success === false && r2?.errors?.itemId === 'Item ID is required',
    r2
  );

  // Case 3: Out-of-bounds quantity returns errors.quantity
  const fd3 = new FormData();
  fd3.set('itemId', 'item_42');
  fd3.set('quantity', '150');
  const r3 = await fn(initialState, fd3);
  $test.check(
    'Out-of-bounds quantity (> 99) returns errors.quantity',
    r3?.success === false && r3?.errors?.quantity === 'Quantity must be between 1 and 99',
    r3
  );

  // Case 4: Non-integer quantity returns errors.quantity
  const fd4 = new FormData();
  fd4.set('itemId', 'item_42');
  fd4.set('quantity', '2.5');
  const r4 = await fn(initialState, fd4);
  $test.check(
    'Non-integer quantity returns errors.quantity',
    r4?.success === false && r4?.errors?.quantity === 'Quantity must be between 1 and 99',
    r4
  );

  // Case 5: Both fields invalid returns both errors simultaneously
  const fd5 = new FormData();
  fd5.set('itemId', '');
  fd5.set('quantity', '0');
  const r5 = await fn(initialState, fd5);
  $test.check(
    'Both fields invalid returns errors for both itemId and quantity',
    r5?.success === false &&
      r5?.errors?.itemId === 'Item ID is required' &&
      r5?.errors?.quantity === 'Quantity must be between 1 and 99',
    r5
  );
})();

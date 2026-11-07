interface ActionState {
  success: boolean;
  errors?: {
    itemId?: string;
    quantity?: string;
  };
  cart?: {
    itemId: string;
    quantity: number;
    total: number;
  };
}

const updateCartQuantity = async (
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const itemId = formData.get('itemId');
  const quantityRaw = formData.get('quantity');

  const errors: NonNullable<ActionState['errors']> = {};

  if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
    errors.itemId = 'Item ID is required';
  }

  const q = quantityRaw !== null && quantityRaw !== '' ? Number(quantityRaw) : NaN;
  if (!Number.isInteger(q) || q < 1 || q > 99) {
    errors.quantity = 'Quantity must be between 1 and 99';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    cart: {
      itemId: String(itemId).trim(),
      quantity: q,
      total: q * 25,
    },
  };
};

'use server';

interface UpdateProductInput {
  id: string;
  price: number;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

async function updateProduct({ id, price }: UpdateProductInput): Promise<ActionResult> {
  const res = await fetch(`https://api.example.com/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price }),
  });

  if (!res.ok) {
    return { success: false, error: 'Update failed' };
  }

  revalidateTag('products');
  revalidatePath(`/products/${id}`);

  return { success: true };
}

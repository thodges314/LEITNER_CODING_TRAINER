interface Product {
  id: string;
  name: string;
  price: number;
}

interface InventoryData {
  productId: string;
  stock: number;
  available: boolean;
}

async function fetchProductCatalog(category: string): Promise<Product[]> {
  const url = `https://api.example.com/products?category=${encodeURIComponent(category)}`;
  const res = await fetch(url, {
    next: {
      revalidate: 60,
      tags: ['products', `category-${category}`],
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch product catalog');
  }

  return res.json();
}

async function fetchLiveInventory(productId: string): Promise<InventoryData> {
  const url = `https://api.example.com/inventory/${encodeURIComponent(productId)}`;
  const res = await fetch(url, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch live inventory');
  }

  return res.json();
}

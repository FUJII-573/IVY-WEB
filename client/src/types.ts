export interface InventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number; // Stock quantity
  unit: string;
  price: number; // Price per unit
  imageUrl?: string;
}

export interface CartItem {
  id: number;
  name: string;
  category: string;
  qty: number; // Quantity being requisitioned
  unit: string;
  price: number;
  imageUrl?: string;
}

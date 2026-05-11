export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  inventory: number;
  rating: number;
  reviews: Review[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  status: 'pending' | 'confirmed' | 'cooking' | 'delivering' | 'completed' | 'cancelled';
  createdAt: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'customer';
}

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  topProducts: { name: string; count: number }[];
  dailySales: { date: string; amount: number }[];
}

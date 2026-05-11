import { Product, Order } from '../types';
import { supabase } from '../lib/supabase';

const isSupabaseEnabled = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY && supabase);

async function handleResponse(res: Response) {
  if (!res.ok) {
    let errorMsg = `Server error: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // If it's not JSON (e.g. an HTML error page), we'll stick to the status code
      const text = await res.text();
      if (text.includes("Payload Too Large")) {
        errorMsg = "The image or data you are trying to save is too large. Please use a smaller image.";
      } else if (text.startsWith("<!DOCTYPE")) {
        errorMsg = `Server returned an error page (Status: ${res.status}). This often happens when a route is missing or the server crashes.`;
      }
    }
    throw new Error(errorMsg);
  }
  
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  }
  return null;
}

export const dataService = {
  // Products
  async getProducts(): Promise<Product[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return data || [];
    } else {
      const res = await fetch('/api/products');
      return handleResponse(res);
    }
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('products').insert([product]).select().single();
      if (error) throw error;
      return data;
    } else {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      return handleResponse(res);
    }
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    } else {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return handleResponse(res);
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (isSupabaseEnabled) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    } else {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      return handleResponse(res);
    }
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const res = await fetch('/api/orders');
      return handleResponse(res);
    }
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    if (isSupabaseEnabled) {
      // 1. Create the order
      const { data: newOrder, error: orderError } = await supabase.from('orders').insert([order]).select().single();
      if (orderError) throw orderError;

      // 2. Decrement inventory for each item
      if (order.items) {
        for (const item of order.items) {
          // In a real app, you'd use a RPC call to ensure atomicity
          // but for this demo, we'll fetch and update
          const { data: product } = await supabase.from('products').select('inventory').eq('id', item.id).single();
          if (product) {
            await supabase.from('products').update({ 
              inventory: Math.max(0, product.inventory - item.quantity) 
            }).eq('id', item.id);
          }
        }
      }
      
      return newOrder;
    } else {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      return handleResponse(res);
    }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('orders').update({ status }).eq('id', orderId).select().single();
      if (error) throw error;
      return data;
    } else {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      return handleResponse(res);
    }
  },

  // Real-time subscriptions
  subscribeToOrders(callback: (order: Order) => void) {
    if (isSupabaseEnabled) {
      return supabase
        .channel('orders-channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
          callback(payload.new as Order);
        })
        .subscribe();
    }
    return null;
  },

  subscribeToProducts(callback: (product: Product) => void) {
    if (isSupabaseEnabled) {
      return supabase
        .channel('products-channel')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, payload => {
          // For products, we want to listen to all events (INSERT, UPDATE, DELETE)
          // but for simplicity in UI, we trigger a refresh or handle specific payload
          // Here we just pass the new/updated product
          callback(payload.new as Product);
        })
        .subscribe();
    }
    return null;
  },

  subscribeToOrderUpdates(orderId: string, callback: (order: Order) => void) {
    if (isSupabaseEnabled) {
      return supabase
        .channel(`order-status-${orderId}`)
        .on('postgres_changes', { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, payload => {
          callback(payload.new as Order);
        })
        .subscribe();
    }
    return null;
  }
};

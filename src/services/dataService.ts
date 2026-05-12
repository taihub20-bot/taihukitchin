import { supabase } from '../lib/supabase';
import { Product, Order, User } from '../types';

export const dataService = {
  // Products
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        status: 'pending',
        createdAt: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Real-time subscriptions
  subscribeToOrders(callback: (order: Order) => void) {
    const subscription = supabase
      .channel('orders-channel')
      .on('postgres_changes' as any, { event: '*', table: 'orders' }, (payload: any) => {
        callback(payload.new as Order);
      })
      .subscribe();
    
    return subscription;
  },

  subscribeToProducts(callback: (product: Product) => void) {
    const subscription = supabase
      .channel('products-channel')
      .on('postgres_changes' as any, { event: '*', table: 'products' }, (payload: any) => {
        callback(payload.new as Product);
      })
      .subscribe();
    
    return subscription;
  },

  subscribeToOrderUpdates(orderId: string, callback: (order: Order) => void) {
    const subscription = supabase
      .channel(`order-update-${orderId}`)
      .on('postgres_changes' as any, 
        { 
          event: 'UPDATE', 
          table: 'orders', 
          filter: `id=eq.${orderId}` 
        }, 
        (payload: any) => {
          callback(payload.new as Order);
        }
      )
      .subscribe();
    
    return subscription;
  },

  async login(credentials: { email: string, password?: string }): Promise<User> {
    // Note: For a "Customer Login" with just a phone/email we might use a custom table 
    // or Supabase Auth. Since the current app uses simple email/password in data.json:
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', credentials.email)
      .eq('password', credentials.password)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Invalid credentials');
      }
      throw error;
    }
    
    return data;
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('id', userId)
      .eq('password', oldPassword);
    
    if (error) throw error;
  }
};


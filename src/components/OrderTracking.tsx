import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle2, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { Order } from '../types';

import { dataService } from '../services/dataService';

export default function OrderTracking() {
  const location = useLocation();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customerInfo, setCustomerInfo] = useState<{name: string, phone: string} | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('customerInfo');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCustomerInfo(parsed);
      fetchCustomerOrders(parsed.phone);
    }
  }, []);

  const fetchCustomerOrders = async (phone: string) => {
    if (!phone) return;
    try {
      const allOrders = await dataService.getOrders();
      const filtered = allOrders.filter(o => o.customerPhone === phone);
      // Sort by latest
      setRecentOrders(filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      console.error("Failed to fetch customer orders", err);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setOrderId(id);
      trackOrder(id);
    }
  }, [location.search]);

  const trackOrder = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError('');
    
    try {
      const allOrders = await dataService.getOrders();
      const found = allOrders.find(o => o.id === id);
      if (found) {
        setOrder(found);
      } else {
        setError('Order not found. Please check your ID.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (order?.id) {
      const sub = dataService.subscribeToOrderUpdates(order.id, (updatedOrder) => {
        setOrder(updatedOrder);
      });
      return () => {
        if (sub) sub.unsubscribe();
      };
    }
  }, [order?.id]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder(orderId);
  };

  const steps = [
    { key: 'pending', label: 'Order Received', icon: Clock },
    { key: 'cooking', label: 'In Kitchen', icon: Package },
    { key: 'delivering', label: 'Out for Delivery', icon: MapPin },
    { key: 'completed', label: 'Delivered', icon: CheckCircle2 }
  ];

  const currentStepIndex = order ? steps.findIndex(s => s.key === order.status) : -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-serif font-bold text-accent mb-4 tracking-tighter">Track Your Order</h1>
        <p className="text-accent/40">Enter your order ID to see real-time updates.</p>
      </div>

      <form onSubmit={handleTrack} className="mb-12">
        <div className="relative group">
          <input 
            type="text" 
            placeholder="e.g. ORD-1234"
            className="w-full pl-14 pr-32 py-5 rounded-3xl bg-white border border-accent/10 shadow-xl shadow-accent/5 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-xl font-mono"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
          />
          <Search className="absolute left-5 top-5.5 h-6 w-6 text-accent/20 group-focus-within:text-primary transition-colors" />
          <button 
            type="submit"
            disabled={loading}
            className="absolute right-3 top-3 bottom-3 bg-accent text-white px-8 rounded-2xl font-bold hover:bg-primary transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? '...' : 'Track'}
          </button>
        </div>
        {error && <p className="mt-4 text-center text-red-500 text-sm font-bold uppercase tracking-widest">{error}</p>}
      </form>

      <AnimatePresence>
        {order ? (
          <motion.div 
            key="order-detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-10 glass-card rounded-[3rem] shadow-2xl shadow-accent/5 backdrop-blur-2xl"
          >
            <button 
              onClick={() => { setOrder(null); setOrderId(''); }}
              className="mb-6 text-xs font-bold text-primary uppercase tracking-widest flex items-center space-x-1 hover:underline"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              <span>Back to My Orders</span>
            </button>
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent/30">Order Status</span>
                <h3 className="text-3xl font-serif font-bold text-accent capitalize mt-1">{order.status}</h3>
                <p className="text-[10px] font-mono mt-1 text-accent/20">ID: {order.id}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent/30">Estimated Arrival</span>
                <p className="text-xl font-bold text-primary mt-1">20-25 Mins</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative mb-16">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-accent/5 -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 transition-all duration-1000"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
              
              <div className="relative flex justify-between">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isActive = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 transition-all duration-500 ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white border border-accent/10 text-accent/20'}`}>
                        <Icon className="h-6 w-6" />
                        {isCurrent && (
                          <motion.div 
                            layoutId="ping"
                            className="absolute -inset-2 bg-primary/20 rounded-[1.5rem] animate-ping"
                          />
                        )}
                      </div>
                      <span className={`mt-4 text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-accent' : 'text-accent/20'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 pt-12 border-t border-accent/5">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-3 text-accent/60">
                  <Package className="h-5 w-5" />
                  <span className="font-medium">{order.items.length} items being prepared</span>
                </div>
                <span className="font-mono font-bold text-accent">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3 text-accent/60">
                  <MapPin className="h-5 w-5" />
                  <span className="text-sm font-medium">{order.location?.address || 'Standard Delivery'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {recentOrders.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-accent px-4 flex items-center space-x-2">
                  <span>Your Recent Orders</span>
                  {customerInfo && <span className="text-primary text-sm font-sans font-normal opacity-60">as {customerInfo.name}</span>}
                </h2>
                <div className="space-y-3">
                  {recentOrders.map(o => (
                    <motion.div 
                      key={o.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => trackOrder(o.id!)}
                      className="p-6 glass-card rounded-3xl border border-accent/5 hover:border-primary/20 cursor-pointer transition-all hover:shadow-xl group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${o.status === 'completed' ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'}`}>
                            <Package className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-accent/40 uppercase tracking-widest">{new Date(o.createdAt || '').toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            <h4 className="font-bold text-accent group-hover:text-primary transition-colors">#{o.id}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-accent capitalize">{o.status}</p>
                          <p className="text-xs font-mono text-accent/40">₹{o.total?.toLocaleString('en-IN')}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-accent/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-20 bg-accent/5 rounded-[3rem] border border-dashed border-accent/10">
                <Package className="h-12 w-12 text-accent/10 mx-auto mb-4" />
                <p className="text-accent/40 font-medium">No recent orders found for this account.</p>
                {customerInfo ? (
                  <p className="text-[10px] text-accent/30 mt-2 uppercase tracking-widest font-bold">Checked for phone: {customerInfo.phone}</p>
                ) : (
                  <p className="text-[10px] text-accent/30 mt-2 uppercase tracking-widest font-bold">Place an order to see your history here.</p>
                )}
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

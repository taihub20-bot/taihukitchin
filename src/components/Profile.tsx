import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  MapPin, 
  Phone, 
  Mail as MailIcon,
  ShoppingBag,
  Clock,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  LogOut,
  Facebook,
  Instagram,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, Product } from '../types';
import { Link } from 'react-router-dom';

interface ProfileProps {
  customerInfo: { name: string; phone: string; email: string } | null;
  onLogout: () => void;
  onLogin: () => void;
  isAdmin: boolean;
}

export default function Profile({ customerInfo, onLogout, onLogin, isAdmin }: ProfileProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (customerInfo) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          // Filter orders for this customer by phone
          const customerOrders = (data as Order[]).filter(o => o.customerPhone === customerInfo.phone);
          // Sort by newest first
          setOrders(customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [customerInfo]);

  if (!customerInfo) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mb-6">
          <User className="h-10 w-10 text-accent/20" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-accent mb-4">Guest User</h2>
        <p className="text-accent/40 max-w-xs mb-8">Login to see your orders, track deliveries and save your favorite dishes.</p>
        <div className="space-y-4 w-full max-w-xs">
          <button 
            onClick={onLogin}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Login as Customer
          </button>
          {!isAdmin && (
            <Link 
              to="/admin/login"
              className="w-full py-4 bg-accent/5 text-accent rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-accent/10 transition-all"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Admin Login</span>
            </Link>
          )}

          <div className="pt-8 border-t border-accent/5 w-full">
            <p className="text-[10px] font-bold uppercase tracking-widest text-accent/20 mb-6">Connect with us</p>
            <div className="flex justify-center items-center space-x-6">
              <a 
                href="https://www.facebook.com/share/1DfeTYV7hs/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a 
                href="https://www.instagram.com/tai_hub_?utm_source=qr&igsh=MWlqajJ5bzI5YW9mZw%3D%3D" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FFB000] via-[#FF0069] to-[#AD00FF] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md shadow-pink-500/20"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a 
                href="https://wa.me/916901543900" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-sm"
              >
                <MessageCircle className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 pb-32">
      {/* Profile Header */}
      <div className="glass-card p-8 rounded-[2.5rem] mb-8 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
        <div className="relative">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white text-4xl font-bold italic shadow-2xl shadow-primary/20">
            {customerInfo.name.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-accent mb-1">{customerInfo.name}</h1>
              <p className="text-accent/40 text-sm font-medium">Customer since Oct 2023</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-6 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-accent/5 rounded-xl text-accent/60 text-xs font-bold">
              <Phone className="h-4 w-4" />
              <span>{customerInfo.phone}</span>
            </div>
            {customerInfo.email && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-accent/5 rounded-xl text-accent/60 text-xs font-bold">
                <MailIcon className="h-4 w-4" />
                <span>{customerInfo.email}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mb-8">
          <Link 
            to="/admin"
            className="w-full p-6 bg-accent text-white rounded-[2rem] font-bold flex items-center justify-between shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-2xl">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest font-bold mb-1">Admin Access</p>
                <h3 className="text-xl">Go to Dashboard</h3>
              </div>
            </div>
            <ChevronRight className="h-6 w-6" />
          </Link>
        </div>
      )}

      {/* Orders Section */}
      <div>
        <div className="flex justify-between items-end mb-8 px-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-accent">Order History</h2>
            <p className="text-accent/40 text-sm">Your recent meals from Tai Hub</p>
          </div>
          <div className="text-right">
             <p className="text-2xl font-mono font-bold text-primary">{orders.length}</p>
             <p className="text-[10px] text-accent/30 uppercase font-bold tracking-widest">Total Orders</p>
          </div>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-accent/20 font-bold uppercase tracking-widest">Loading orders...</div>
          ) : orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="glass-card p-6 rounded-[2rem] border border-accent/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest 
                  ${order.status === 'completed' ? 'bg-green-500 text-white' : 
                    order.status === 'rejected' ? 'bg-red-500 text-white' : 
                    'bg-primary text-white'}`}>
                  {order.status}
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-32 h-32 bg-accent/5 rounded-2xl overflow-hidden relative group-hover:scale-105 transition-transform">
                     {/* Use the first item's image as order thumbnail if available */}
                     <img 
                      src={order.items[0]?.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"} 
                      alt="Order" 
                      className="w-full h-full object-cover"
                     />
                  </div>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-accent mb-1">Order #{order.id.slice(-6)}</h4>
                        <p className="text-xs text-accent/30 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-mono font-bold text-accent">₹{order.total.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {order.items.map((item, i) => (
                        <span key={i} className="px-3 py-1 bg-accent/5 rounded-lg text-[10px] font-bold text-accent/60 uppercase tracking-widest">
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/track?id=${order.id}`}
                        className="flex items-center space-x-2 text-primary font-bold text-xs uppercase tracking-widest hover:translate-x-1 transition-transform"
                      >
                        <span>Track Delivery</span>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                      
                      {order.status === 'completed' && (
                        <div className="flex items-center text-green-500 font-bold text-[10px] uppercase tracking-widest">
                          <Package className="h-4 w-4 mr-1" />
                          <span>Delivered</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-20 text-center glass-card rounded-[2.5rem] border border-dashed border-accent/10">
              <ShoppingBag className="h-12 w-12 text-accent/10 mx-auto mb-4" />
              <p className="text-accent/30 font-bold uppercase tracking-widest">No orders found yet</p>
              <Link to="/menu" className="mt-8 inline-block px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20">Start Ordering</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

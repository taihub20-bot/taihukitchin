import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
}

export default function Cart({ items, updateQuantity, removeFromCart }: CartProps) {
  const navigate = useNavigate();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 40;
  const total = subtotal + delivery;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-accent/5 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-10 w-10 text-accent/20" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-accent mb-4 text-center">Your Cart is Empty</h2>
        <p className="text-accent/50 mb-8 max-w-xs text-center">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/menu')}
          className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:shadow-lg shadow-primary/20 transition-all flex items-center space-x-2"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Explore Menu</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center space-x-4 mb-12">
        <h1 className="text-5xl font-serif font-bold text-accent tracking-tighter">Your Shopping Basket</h1>
        <span className="px-3 py-1 bg-accent/5 rounded-full text-accent/40 font-mono text-sm">{items.length} items</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence initial={false}>
            {items.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 glass-card rounded-3xl flex items-center space-x-6 relative overflow-hidden group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg shadow-accent/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-accent">{item.name}</h3>
                      <p className="text-sm text-accent/40 capitalize">{item.category}</p>
                    </div>
                    <p className="text-xl font-mono font-bold text-accent">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center bg-accent/5 p-1 rounded-xl border border-accent/10">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Plus className="h-4 w-4" /></button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-accent/20 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button 
            onClick={() => navigate('/menu')}
            className="w-full py-4 border-2 border-dashed border-accent/10 text-accent/40 rounded-3xl font-bold flex items-center justify-center space-x-2 hover:bg-accent/5 hover:border-accent/20 transition-all"
          >
            <Plus className="h-5 w-5" />
            <span>Add More Items</span>
          </button>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="p-8 bg-accent text-white rounded-[2.5rem] shadow-2xl shadow-accent/20 sticky top-32">
            <h2 className="text-3xl font-serif font-bold mb-8">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-white/60">
                <span className="text-sm">Subtotal</span>
                <span className="font-mono font-bold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-white/60">
                <span className="text-sm">Estimated Delivery</span>
                <span className="font-mono font-bold text-white">{delivery === 0 ? 'FREE' : `₹${delivery.toLocaleString('en-IN')}`}</span>
              </div>
              <div className="pt-4 mt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount</span>
                <span className="text-3xl font-mono font-bold text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-white hover:text-accent transition-all group active:scale-95"
            >
              <span>Secure Checkout</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="mt-8 flex items-center justify-center space-x-4 opacity-40">
              <div className="h-10 w-16 bg-white/10 rounded-lg flex items-center justify-center text-[8px] font-bold">VISA</div>
              <div className="h-10 w-16 bg-white/10 rounded-lg flex items-center justify-center text-[8px] font-bold">MASTER</div>
              <div className="h-10 w-16 bg-white/10 rounded-lg flex items-center justify-center text-[8px] font-bold">STRI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

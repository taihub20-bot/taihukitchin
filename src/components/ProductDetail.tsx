import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductDetailProps {
  addToCart: (p: Product) => void;
}

import { dataService } from '../services/dataService';

export default function ProductDetail({ addToCart }: ProductDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');

  useEffect(() => {
    dataService.getProducts()
      .then(data => {
        const found = data.find((p: Product) => p.id === id);
        setProduct(found || null);
      })
      .catch(err => console.error("Error fetching product", err));
  }, [id]);

  if (!product) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-accent/50 hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Menu</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left: Images */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl shadow-accent/5">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                <img src={product.image} alt="" className="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-full">{product.category}</span>
              <span className="text-accent/20">•</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-bold text-accent">{product.rating} (120 reviews)</span>
              </div>
            </div>
            <h1 className="text-5xl font-serif font-bold text-accent mb-4 tracking-tighter">{product.name}</h1>
            <p className="text-3xl font-mono font-bold text-primary mb-6">₹{product.price.toLocaleString('en-IN')}</p>
            <p className="text-accent/60 leading-relaxed mb-8">
              {product.description}
            </p>
          </div>

          <div className="space-y-8 mb-12">
            <div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-4">Quantity</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-accent/5 p-1 rounded-2xl border border-accent/10">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-white rounded-xl transition-colors"><Minus className="h-5 w-5" /></button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-white rounded-xl transition-colors"><Plus className="h-5 w-5" /></button>
                </div>
                <span className="text-sm font-medium text-accent/30">{product.inventory} portions left today</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-auto">
            <button 
              onClick={() => addToCart({ ...product, quantity })}
              className="flex-grow py-5 bg-accent text-white rounded-3xl font-bold flex items-center justify-center space-x-3 hover:bg-primary transition-all active:scale-95"
            >
              <ShoppingBag className="h-6 w-6" />
              <span>Add to Cart — ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
            </button>
            <button className="p-5 bg-green-500/10 text-green-600 rounded-3xl hover:bg-green-500/20 transition-all flex items-center justify-center group focus:ring-2 focus:ring-green-500/20">
              <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-16 border-b border-accent/10 flex space-x-8">
            <button 
              onClick={() => setActiveTab('desc')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'desc' ? 'text-accent' : 'text-accent/30 hover:text-accent/60'}`}
            >
              Description
              {activeTab === 'desc' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'reviews' ? 'text-accent' : 'text-accent/30 hover:text-accent/60'}`}
            >
              Reviews (12)
              {activeTab === 'reviews' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
            </button>
          </div>
          
          <div className="py-8">
            {activeTab === 'desc' ? (
              <div className="prose prose-accent max-w-none text-accent/60 leading-relaxed">
                <p>Enjoy the authentic flavors of our specialty {product.name}. Prepared with locally sourced ingredients and traditional techniques to ensure every bite is a celebration of taste.</p>
                <ul className="grid grid-cols-2 gap-4 mt-6 list-none p-0">
                  <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span>Fresh Ingredients</span></li>
                  <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span>Authentic Recipe</span></li>
                  <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span>Chef Recommended</span></li>
                  <li className="flex items-center space-x-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> <span>Fast Delivery</span></li>
                </ul>
              </div>
            ) : (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="p-6 rounded-3xl bg-accent/5 border border-accent/10">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">J</div>
                        <div>
                          <p className="font-bold text-accent">John Doe</p>
                          <p className="text-[10px] text-accent/30 uppercase tracking-widest">2 days ago</p>
                        </div>
                      </div>
                      <div className="flex space-x-0.5">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                      </div>
                    </div>
                    <p className="text-sm text-accent/60 leading-relaxed">Absolutely delicious! The best {product.name} I've ever had. Will definitely order again.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

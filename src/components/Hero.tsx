import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { t } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if customer is logged in
    const customerInfo = localStorage.getItem('customerInfo');
    setIsLoggedIn(!!customerInfo);
  }, []);

  return (
    <div className="relative h-[50vh] min-h-[400px] md:h-[70vh] w-full overflow-hidden bg-[#fafafa]">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center space-x-2 mb-6 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary">Now Serving Breakfast Specials</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-serif font-bold text-accent leading-[0.85] tracking-tighter mb-8 italic">
            Tai <span className="text-primary drop-shadow-[0_0_20px_rgba(212,175,55,0.3)]">Hub</span>
          </h1>

          <p className="text-accent/70 text-base md:text-lg mb-10 max-w-md leading-relaxed font-medium">
             Discover a world of flavor in every bite. From farm-to-table freshness to our chef's nightly creations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
            <Link 
              to="/menu"
              className="px-10 py-4 bg-accent text-white rounded-2xl font-bold flex items-center justify-center space-x-3 hover:bg-primary transition-all group overflow-hidden relative shadow-2xl shadow-accent/20 active:scale-95"
            >
              <span className="relative z-10">View Our Menu</span>
              <ArrowRight className="h-5 w-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {isLoggedIn && (
              <Link 
                to="/track"
                className="px-6 py-4 border-2 border-accent/10 text-accent/60 rounded-2xl font-bold hover:bg-accent/5 transition-all text-sm"
              >
                Track Order
              </Link>
            )}
          </div>
        </motion.div>
      </div>

      {/* Hero Image Section */}
      <motion.div 
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        className="absolute top-0 right-0 w-full md:w-3/5 h-full z-0"
      >
        <div className="relative w-full h-full">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80" 
            alt="Delicious Gourmet Dish"
            className="w-full h-full object-cover object-center opacity-80"
          />
          {/* Vibrant Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent"></div>
          
          {/* Floating Badge */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 right-1/4 p-4 glass-card rounded-3xl border border-white/20 shadow-2xl z-20 hidden lg:block"
          >
             <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold text-xl">★</div>
                <div>
                   <p className="text-[10px] uppercase font-bold text-accent/40 tracking-widest">Today's Special</p>
                   <p className="text-sm font-bold text-accent">Honey Glazed Salmon</p>
                </div>
             </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

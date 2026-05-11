import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <div className="relative h-[50vh] min-h-[300px] md:h-[60vh] w-full overflow-hidden hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md"
        >
          
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-accent leading-[0.9] tracking-tighter mb-4 italic">
            Tai <span className="text-primary">Hub</span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              to="/menu"
              className="px-5 py-2.5 bg-accent text-white rounded-lg font-bold flex items-center justify-center space-x-2 hover:bg-primary transition-all group overflow-hidden relative text-xs"
            >
              <span className="relative z-10">Order Now</span>
              <ArrowRight className="h-3.5 w-3.5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute bottom-0 right-0 w-2/3 md:w-1/2 h-full pointer-events-none select-none"
      >
        <img 
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80" 
          alt="Delicious Food"
          className="w-full h-full object-cover object-left-bottom opacity-40 mix-blend-multiply grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#fafafa]"></div>
      </motion.div>
      
      <div className="absolute top-1/2 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}

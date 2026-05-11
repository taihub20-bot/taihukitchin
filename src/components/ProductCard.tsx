import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  addToCart: (p: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, addToCart }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group relative glass-card rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-auto h-36 sm:h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md text-accent text-[8px] font-bold uppercase tracking-wider rounded-md shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center space-x-0.5 px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded-md shadow-sm">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[8px] font-bold text-accent">{product.rating}</span>
          </div>
        </div>
        
        <button 
          onClick={() => addToCart(product)}
          className="absolute bottom-2 right-2 w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg shadow-primary/30 transform sm:translate-y-20 group-hover:translate-y-0 transition-transform duration-500 hover:scale-110"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="p-2 sm:p-4">
        <Link to={`/product/${product.id}`} className="block">
          <div className="flex justify-between items-start mb-0.5">
            <h3 className="text-sm sm:text-base font-serif font-bold text-accent group-hover:text-primary transition-colors truncate">
              {product.name}
            </h3>
          </div>
        </Link>
        <p className="text-accent/50 text-[9px] sm:text-xs line-clamp-1 sm:line-clamp-2 mb-2 sm:mb-3 leading-tight">
          {product.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-base sm:text-lg font-mono font-bold text-accent">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span className={`text-[8px] font-bold uppercase tracking-widest ${product.inventory > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {product.inventory > 0 ? `Stock` : 'Out'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

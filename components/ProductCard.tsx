
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-slate-800 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:ring-2 hover:ring-cyan-400">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-white">{product.name}</h3>
        <p className="text-sm text-slate-400 mt-1 h-10 overflow-hidden">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-semibold text-cyan-400">${product.price.toFixed(2)}</span>
          <span className="text-xs text-slate-500 font-mono">ID: {product.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

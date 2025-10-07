import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover bg-gray-100" />
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 h-10 overflow-hidden">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-semibold text-gray-800">${product.price.toFixed(2)}</span>
          <span className="text-xs text-gray-400 font-mono">ID: {product.id}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

import React, { useState } from 'react';
import { Product } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden group transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img 
            src={product.images[currentImageIndex]} 
            alt={`${product.name} image ${currentImageIndex + 1}`} 
            className="w-full h-48 object-cover bg-gray-100" 
        />
        {product.images.length > 1 && (
          <>
            <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={handlePrevImage}
                    className="bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                    aria-label="Previous image"
                >
                    <ChevronLeftIcon className="w-5 h-5"/>
                </button>
                <button 
                    onClick={handleNextImage}
                    className="bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
                    aria-label="Next image"
                >
                    <ChevronRightIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {product.images.map((_, index) => (
                    <div 
                        key={index}
                        className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'} transition-colors`}
                    />
                ))}
            </div>
          </>
        )}
      </div>
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
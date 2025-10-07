import React from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-200 pb-2">Product Catalog</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
            <p>No products found.</p>
            <p className="text-sm">Try asking the agent to search for something else.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

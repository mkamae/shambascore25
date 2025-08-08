
import React from 'react';
import { Product, ProductType } from '../types';
import { useCart } from '../hooks/useCart';
import { PlusIcon } from './icons/PlusIcon';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    dispatch({ type: 'ADD_ITEM', payload: product });
  };
  
  const getTypePill = (type: ProductType) => {
    switch(type) {
        case ProductType.EVENT:
            return <span className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Event</span>;
        case ProductType.SERVICE:
            return <span className="absolute top-2 left-2 bg-orange-100 text-orange-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">Service</span>;
        default:
            return null;
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl">
      <div className="relative">
        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-48 object-cover" />
        {getTypePill(product.type)}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
        <p className="text-sm text-gray-600 mt-1 flex-grow">{product.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-lg font-bold text-teal-600">Ksh {product.price.toLocaleString()}</p>
          <button 
            onClick={handleAddToCart}
            className="flex items-center justify-center px-3 py-2 bg-teal-500 text-white rounded-md shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transform transition-transform duration-200 group-hover:scale-105"
          >
            <PlusIcon className="h-5 w-5 mr-1"/>
            <span className="text-sm font-medium">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { Creator, Product } from '../types';
import { ProductCard } from './ProductCard';
import { InstagramIcon } from './icons/InstagramIcon';

interface CreatorStorefrontProps {
  creator: Creator;
  products: Product[];
}

export const CreatorStorefront: React.FC<CreatorStorefrontProps> = ({ creator, products }) => {
  return (
    <div className="space-y-8">
      {/* Creator Profile Header */}
      <div className="bg-white shadow rounded-lg p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <img src={creator.avatarUrl} alt={creator.name} className="w-24 h-24 rounded-full object-cover border-4 border-teal-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{creator.name}</h1>
          <div className="flex items-center space-x-4">
            <p className="text-md text-teal-600 font-medium">{creator.handle}</p>
            {creator.instagramHandle && (
                <a href={`https://instagram.com/${creator.instagramHandle}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-pink-600">
                    <span className="sr-only">Instagram</span>
                    <InstagramIcon className="h-6 w-6"/>
                </a>
            )}
          </div>
          <p className="mt-2 text-gray-600 max-w-lg">{creator.bio}</p>
        </div>
      </div>

      {/* Products Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Duka / Items on Sale</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
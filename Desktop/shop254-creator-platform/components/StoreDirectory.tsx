import React, { useState, useMemo } from 'react';
import { useCreators } from '../hooks/useDatabase';
import { SearchIcon } from './icons/SearchIcon';
import { FilterIcon } from './icons/FilterIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { StoreIcon } from './icons/StoreIcon';

interface StoreDirectoryProps {
  onStoreClick: (creator: any) => void;
}

export const StoreDirectory: React.FC<StoreDirectoryProps> = ({ onStoreClick }) => {
  const { creators, loading } = useCreators();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get approved creators
  const approvedCreators = useMemo(() => {
    return creators.filter(creator => creator.status === 'APPROVED');
  }, [creators]);

  // Filter creators based on search and category
  const filteredCreators = useMemo(() => {
    let filtered = approvedCreators;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(creator =>
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.business_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.handle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(creator =>
        creator.business_category === selectedCategory
      );
    }

    return filtered;
  }, [approvedCreators, searchTerm, selectedCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(approvedCreators.map(creator => creator.business_category))];
    return ['all', ...uniqueCategories];
  }, [approvedCreators]);

  const handleShareStore = (creator: any, platform: string) => {
    const storeUrl = `${window.location.origin}/store/${creator.handle}`;
    const message = `Check out ${creator.name}'s amazing products on Shop254! ${storeUrl}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(storeUrl);
        alert('Store link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Explore Stores
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing products from verified creators across Kenya
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search stores, categories, or handles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilterIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 appearance-none bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No stores found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'No stores are available yet.'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredCreators.length} of {approvedCreators.length} stores
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCreators.map((creator) => (
                <div key={creator.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-teal-100 to-blue-100 p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={creator.avatar_url || `https://picsum.photos/seed/${creator.name}/100/100`}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{creator.name}</h3>
                        <p className="text-gray-600 text-sm">{creator.business_category}</p>
                        <p className="text-teal-600 text-sm font-medium">{creator.handle}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {creator.bio || 'Amazing products and services from this creator.'}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => onStoreClick(creator)}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                      >
                        Visit Store
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShareStore(creator, 'whatsapp')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                          title="Share on WhatsApp"
                        >
                          <WhatsappIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'instagram')}
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                          title="Share on Instagram"
                        >
                          <InstagramIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'facebook')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="Share on Facebook"
                        >
                          <FacebookIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'twitter')}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                          title="Share on Twitter"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

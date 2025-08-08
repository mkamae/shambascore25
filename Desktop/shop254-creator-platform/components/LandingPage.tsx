import React from 'react';
import { useCreators } from '../hooks/useDatabase';
import { StoreIcon } from './icons/StoreIcon';
import { UserIcon } from './icons/UserIcon';
import { ArrowRightIcon } from './icons/ArrowRightIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';

interface LandingPageProps {
  onCreateStore: () => void;
  onExploreStores: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onCreateStore,
  onExploreStores,
  onLogin
}) => {
  const { creators, loading } = useCreators();
  
  // Get featured approved creators
  const featuredCreators = creators
    .filter(creator => creator.status === 'APPROVED')
    .slice(0, 6);

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
        // Instagram doesn't support direct sharing via URL, so we'll copy to clipboard
        navigator.clipboard.writeText(storeUrl);
        alert('Store link copied to clipboard!');
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">
                Jenga Biashara Yako
              </span>
              <br />
              <span className="text-gray-800">Online</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Sell online, get paid via M-Pesa, and grow your audience. 
              <br />
              <span className="text-teal-600 font-semibold">Shop254</span> - Your digital marketplace in Kenya.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onCreateStore}
                className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
              >
                <StoreIcon className="h-6 w-6" />
                <span>Create Your Store</span>
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={onExploreStores}
                className="bg-white text-teal-600 border-2 border-teal-600 px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
              >
                <span>Explore Stores</span>
              </button>
              
              <button
                onClick={onLogin}
                className="bg-gray-800 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
              >
                <UserIcon className="h-5 w-5" />
                <span>Login</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">{creators.filter(c => c.status === 'APPROVED').length}+</div>
                <div className="text-gray-600">Active Stores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">24hrs</div>
                <div className="text-gray-600">Approval Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">M-Pesa</div>
                <div className="text-gray-600">Instant Payouts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stores Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Stores
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing products from our verified creators across Kenya
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCreators.map((creator) => (
                <div key={creator.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-teal-100 to-blue-100 p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={creator.avatar_url || `https://picsum.photos/seed/${creator.name}/100/100`}
                        alt={creator.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
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
                        onClick={() => window.open(`/store/${creator.handle}`, '_blank')}
                        className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                      >
                        Visit Store
                      </button>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleShareStore(creator, 'whatsapp')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        >
                          <WhatsappIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'instagram')}
                          className="p-2 text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                        >
                          <InstagramIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'facebook')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        >
                          <FacebookIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShareStore(creator, 'twitter')}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {featuredCreators.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured stores available yet.</p>
              <button
                onClick={onCreateStore}
                className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Be the First!
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-600">
                Fill out our simple application form with your business details
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Approved</h3>
              <p className="text-gray-600">
                Our team reviews your application within 24 hours
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Selling</h3>
              <p className="text-gray-600">
                Upload products and start earning with instant M-Pesa payouts
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

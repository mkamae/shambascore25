import React, { useState } from 'react';
import { useCart } from '../hooks/useCart';
import { Cart } from './Cart';
import { UserIcon } from './icons/UserIcon';
import { StoreIcon } from './icons/StoreIcon';
import { CartIcon } from './icons/CartIcon';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { HomeIcon } from './icons/HomeIcon';
import { View } from '../App';

interface HeaderProps {
  view: View;
  setView: (view: View) => void;
  creatorName: string;
  onLogout?: () => void;
  onLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  view, 
  setView, 
  creatorName, 
  onLogout,
  onLogin 
}) => {
  const { state: cartState } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const cartItemCount = cartState.items.reduce((acc, item) => acc + item.quantity, 0);
  
  const getButtonClass = (buttonView: View) => {
    return view === buttonView 
      ? 'bg-teal-500 text-white shadow' 
      : 'text-gray-600 hover:bg-gray-200';
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <button 
                onClick={() => setView('HOME')}
                className="text-xl font-bold text-teal-600 hover:text-teal-700 transition-colors"
              >
                Shop254
              </button>
            </div>
            
            {/* Navigation */}
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-full">
                <button 
                  onClick={() => setView('HOME')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-2 ${getButtonClass('HOME')}`}
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </button>
                
                <button 
                  onClick={() => setView('DIRECTORY')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-2 ${getButtonClass('DIRECTORY')}`}
                >
                  <StoreIcon className="h-5 w-5" />
                  <span>Stores</span>
                </button>
                
                <button 
                  onClick={() => setView('SELLER')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-2 ${getButtonClass('SELLER')}`}
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                
                <button 
                  onClick={() => setView('ADMIN')} 
                  className={`px-3 py-1.5 text-sm font-medium rounded-full flex items-center space-x-2 ${getButtonClass('ADMIN')}`}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                aria-label={`Cart with ${cartItemCount} items`}
              >
                <span className="sr-only">Open cart</span>
                <CartIcon className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                    {cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {creatorName && creatorName !== 'Creator' ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 hidden sm:block">
                    Welcome, {creatorName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="sm:hidden pb-3">
            <div className="flex items-center justify-center space-x-1 bg-gray-100 p-1 rounded-full">
              <button 
                onClick={() => setView('HOME')} 
                className={`flex-1 justify-center py-1.5 text-xs font-medium rounded-full flex items-center space-x-2 ${getButtonClass('HOME')}`}
              >
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              <button 
                onClick={() => setView('DIRECTORY')} 
                className={`flex-1 justify-center py-1.5 text-xs font-medium rounded-full flex items-center space-x-2 ${getButtonClass('DIRECTORY')}`}
              >
                <StoreIcon className="h-4 w-4" />
                <span>Stores</span>
              </button>
              
              <button 
                onClick={() => setView('SELLER')} 
                className={`flex-1 justify-center py-1.5 text-xs font-medium rounded-full flex items-center space-x-2 ${getButtonClass('SELLER')}`}
              >
                <UserIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <Cart isOpen={isCartOpen} setIsOpen={setIsCartOpen} />
    </>
  );
};
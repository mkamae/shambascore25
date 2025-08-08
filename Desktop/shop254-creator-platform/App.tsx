import React, { useState, useEffect } from 'react';
import { CreatorDashboard } from './components/CreatorDashboard';
import { CreatorStorefront } from './components/CreatorStorefront';
import { Header } from './components/Header';
import { CartProvider } from './hooks/useCart';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatorApplicationForm } from './components/CreatorApplicationForm';
import { ApplicationStatus } from './components/ApplicationStatus';
import { LandingPage } from './components/LandingPage';
import { LoginModal } from './components/LoginModal';
import { StoreDirectory } from './components/StoreDirectory';
import { useCreators, useProducts } from './hooks/useDatabase';

export type View = 'HOME' | 'STOREFRONT' | 'SELLER' | 'ADMIN' | 'DIRECTORY' | 'APPLICATION' | 'STATUS';

const App: React.FC = () => {
  const [view, setView] = useState<View>('HOME');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [currentCreator, setCurrentCreator] = useState<any>(null);
  const [selectedStore, setSelectedStore] = useState<any>(null);
  
  const { creators, loading: creatorsLoading, error: creatorsError } = useCreators();
  const { products, loading: productsLoading, error: productsError } = useProducts();

  // Check for existing session on app load
  useEffect(() => {
    const savedCreator = localStorage.getItem('currentCreator');
    if (savedCreator) {
      try {
        const creator = JSON.parse(savedCreator);
        setCurrentCreator(creator);
        // Check if creator is still approved
        const updatedCreator = creators.find(c => c.id === creator.id);
        if (updatedCreator && updatedCreator.status === 'APPROVED') {
          setCurrentCreator(updatedCreator);
        } else if (updatedCreator && updatedCreator.status === 'PENDING') {
          setView('STATUS');
        } else if (updatedCreator && updatedCreator.status === 'REJECTED') {
          setView('STATUS');
        }
      } catch (error) {
        console.error('Error parsing saved creator:', error);
        localStorage.removeItem('currentCreator');
      }
    }
  }, [creators]);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    // In a real app, you would validate credentials against the database
    // For now, we'll simulate login by finding a creator with matching email/phone
    const creator = creators.find(c => 
      c.telephone_number === credentials.email || 
      c.email === credentials.email
    );

    if (creator) {
      if (creator.status === 'APPROVED') {
        setCurrentCreator(creator);
        localStorage.setItem('currentCreator', JSON.stringify(creator));
        setView('SELLER');
        setIsLoginModalOpen(false);
      } else if (creator.status === 'PENDING') {
        setCurrentCreator(creator);
        setView('STATUS');
        setIsLoginModalOpen(false);
      } else {
        throw new Error('Your application is still under review or was not approved.');
      }
    } else {
      throw new Error('Invalid credentials. Please check your email/phone and password.');
    }
  };

  const handleLogout = () => {
    setCurrentCreator(null);
    localStorage.removeItem('currentCreator');
    setView('HOME');
  };

  const handleCreateStore = () => {
    setView('APPLICATION');
  };

  const handleExploreStores = () => {
    setView('DIRECTORY');
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleStoreClick = (creator: any) => {
    setSelectedStore(creator);
    setView('STOREFRONT');
  };

  const handleBackToHome = () => {
    setView('HOME');
  };

  const renderContent = () => {
    if (creatorsLoading || productsLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-500"></div>
        </div>
      );
    }

    if (creatorsError || productsError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading data: {creatorsError || productsError}</p>
        </div>
      );
    }

    switch(view) {
      case 'HOME':
        return (
          <LandingPage
            onCreateStore={handleCreateStore}
            onExploreStores={handleExploreStores}
            onLogin={handleLoginClick}
          />
        );
      
      case 'DIRECTORY':
        return (
          <StoreDirectory onStoreClick={handleStoreClick} />
        );
      
      case 'APPLICATION':
        return (
          <CreatorApplicationForm />
        );
      
      case 'STATUS':
        return currentCreator ? (
          <ApplicationStatus 
            creator={currentCreator} 
            onBackToHome={handleBackToHome}
          />
        ) : (
          <div className="text-center py-10">
            <p>No application found.</p>
            <button
              onClick={handleBackToHome}
              className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        );
      
      case 'STOREFRONT':
        if (selectedStore) {
          return <CreatorStorefront creator={selectedStore} products={products} />;
        }
        // Fallback to first approved creator
        const approvedCreator = creators.find(c => c.status === 'APPROVED');
        if (!approvedCreator) {
          return <div className="text-center py-10">No approved creators found.</div>;
        }
        return <CreatorStorefront creator={approvedCreator} products={products} />;
      
      case 'ADMIN':
        return <AdminDashboard />;
      
      case 'SELLER':
      default:
        if (!currentCreator) {
          return (
            <div className="text-center py-10">
              <p>Please log in to access your dashboard.</p>
              <button
                onClick={handleLoginClick}
                className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
              >
                Login
              </button>
            </div>
          );
        }
        
        switch(currentCreator.status) {
          case 'APPROVED':
            return <CreatorDashboard creator={currentCreator} products={products} />;
          case 'PENDING':
          case 'REJECTED':
            return <ApplicationStatus creator={currentCreator} onBackToHome={handleBackToHome} />;
          default:
            return <CreatorApplicationForm />;
        }
    }
  };

  return (
    <CartProvider>
      <div className="min-h-screen bg-gray-50 text-gray-800">
        {view !== 'HOME' && (
          <Header 
            view={view} 
            setView={setView}
            creatorName={currentCreator?.name || 'Creator'}
            onLogout={handleLogout}
            onLogin={handleLoginClick}
          />
        )}
        
        <main className={view === 'HOME' ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}>
          {renderContent()}
        </main>
        
        {view === 'HOME' && (
          <footer className="text-center p-4 text-xs text-gray-500 mt-8">
            <p>Shop254 &copy; {new Date().getFullYear()}. Jenga biashara yako. </p>
          </footer>
        )}
        
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
          onForgotPassword={() => alert('Password reset functionality coming soon!')}
          onSwitchToSignup={handleCreateStore}
        />
      </div>
    </CartProvider>
  );
};

export default App;
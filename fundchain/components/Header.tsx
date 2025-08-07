import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { WalletIcon, LogoIcon, MenuIcon, XIcon } from './icons';

const Header: React.FC = () => {
  const { isConnected, principal, connectWallet, loading, disconnectWallet } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatPrincipal = (p: string) => `${p.slice(0, 5)}...${p.slice(-3)}`;

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const navLinks = (
    <>
      <NavLink to="/" className={isMenuOpen ? mobileNavLinkClass : navLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
      <NavLink to="/create" className={isMenuOpen ? mobileNavLinkClass : navLinkClass} onClick={() => setIsMenuOpen(false)}>Create Project</NavLink>
      {isConnected && (
        <NavLink to="/my-projects" className={isMenuOpen ? mobileNavLinkClass : navLinkClass} onClick={() => setIsMenuOpen(false)}>My Projects</NavLink>
      )}
    </>
  );

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-800">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 text-white font-bold text-xl">
              <LogoIcon className="h-8 w-8 text-brand-500" />
              FundChain
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">{navLinks}</div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {isConnected && principal ? (
              <div className="flex items-center gap-4">
                  <span className="text-sm font-mono bg-slate-800 px-3 py-1.5 rounded-md text-slate-300">{formatPrincipal(principal)}</span>
                  <button onClick={disconnectWallet} className="text-slate-400 hover:text-white text-sm">Logout</button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
              >
                <WalletIcon className="h-5 w-5" />
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300 hover:text-white">
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
            <div className="md:hidden pb-3 space-y-1">
                {navLinks}
                <div className="pt-4 mt-4 border-t border-slate-700">
                 {isConnected && principal ? (
                  <div className="flex items-center justify-between">
                      <span className="text-sm font-mono bg-slate-800 px-3 py-1.5 rounded-md text-slate-300">{formatPrincipal(principal)}</span>
                      <button onClick={disconnectWallet} className="text-slate-400 hover:text-white text-sm">Logout</button>
                  </div>
                ) : (
                  <button
                    onClick={() => { connectWallet(); setIsMenuOpen(false); }}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50"
                  >
                    <WalletIcon className="h-5 w-5" />
                    {loading ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
                </div>
            </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

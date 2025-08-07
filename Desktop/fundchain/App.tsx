import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { PlugWalletProvider } from './context/PlugWalletContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import MyProjectsPage from './pages/MyProjectsPage';

const App: React.FC = () => {
  return (
    <PlugWalletProvider>
      <ToastProvider>
        <HashRouter>
          <div className="min-h-screen flex flex-col bg-slate-900">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateProjectPage />} />
                <Route path="/project/:id" element={<ProjectDetailsPage />} />
                <Route path="/my-projects" element={<MyProjectsPage />} />
              </Routes>
            </main>
            <footer className="bg-slate-900 border-t border-slate-800">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500">
                  <p>&copy; {new Date().getFullYear()} FundChain. Powered by the Internet Computer.</p>
              </div>
            </footer>
          </div>
        </HashRouter>
      </ToastProvider>
    </PlugWalletProvider>
  );
};

export default App;

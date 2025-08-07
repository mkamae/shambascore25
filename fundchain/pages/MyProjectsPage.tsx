import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import * as icpService from '../services/icp';
import { useWallet } from '../context/WalletContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';

const MyProjectsPage: React.FC = () => {
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { principal, isConnected, connectWallet } = useWallet();

  useEffect(() => {
    if (!principal) return;

    const fetchProjects = async () => {
      setLoading(true);
      try {
        const allProjects = await icpService.getProjects();
        const userProjects = allProjects.filter(p => p.creatorPrincipal === principal);
        setMyProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch user projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [principal]);

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Connect Your Wallet</h2>
        <p className="mb-6 text-slate-400">Please connect your Plug Wallet to see your projects.</p>
        <button onClick={connectWallet} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
            Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-center mb-12 text-white">My Projects</h1>
      
      {loading ? (
        <div className="text-center text-slate-400">Loading your projects...</div>
      ) : myProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-800 rounded-xl">
            <h3 className="text-xl font-semibold text-white">No projects found.</h3>
            <p className="text-slate-400 mt-2 mb-6">Ready to start something new?</p>
            <Link to="/create" className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-6 rounded-md transition-colors">
                Create Your First Project
            </Link>
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;

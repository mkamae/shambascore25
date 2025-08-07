import React, { useState, useEffect } from 'react';
import * as icpService from '../services/icp';
import { usePlugWallet } from '../context/PlugWalletContext';
import ProjectCard from '../components/ProjectCard';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const MyProjectsPage: React.FC = () => {
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);
  const { principal, isConnected, connect } = usePlugWallet();
  const toast = useToast();

  useEffect(() => {
    if (!principal) return;
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const allProjects = await icpService.listProjects();
        const userProjects = allProjects.filter((p: any) => p.creator === principal);
        setMyProjects(userProjects);
      } catch (error) {
        console.error("Failed to fetch user projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [principal]);

  const handleWithdraw = async (id: number) => {
    setWithdrawing(id);
    try {
      const ok = await icpService.withdrawFunds(id);
      if (ok) {
        toast.addToast('Withdrawal successful!', 'success');
        setMyProjects(projects => projects.map(p => p.id === id ? { ...p, withdrawn: true } : p));
      } else {
        toast.addToast('Withdrawal failed. Check if goal is met and not already withdrawn.', 'error');
      }
    } catch (e) {
      toast.addToast('Withdrawal failed. Please try again.', 'error');
    } finally {
      setWithdrawing(null);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Connect Your Wallet</h2>
        <p className="mb-6 text-slate-400">Please connect your Plug Wallet to see your projects.</p>
        <button onClick={connect} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
          Connect Plug Wallet
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
            <div key={project.id} className="relative">
              <ProjectCard project={project} />
              {!project.withdrawn && project.raised >= project.goal && (
                <button
                  onClick={() => handleWithdraw(project.id)}
                  disabled={withdrawing === project.id}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md shadow-lg transition disabled:opacity-50">
                  {withdrawing === project.id ? 'Withdrawing...' : 'Withdraw Funds'}
                </button>
              )}
              {project.withdrawn && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-green-400 font-bold">Withdrawn</div>
              )}
            </div>
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

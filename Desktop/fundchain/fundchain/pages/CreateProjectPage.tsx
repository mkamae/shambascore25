import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlugWallet } from '../context/PlugWalletContext';
import * as icpService from '../services/icp';
import { useToast } from '../context/ToastContext';

const CreateProjectPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { principal, isConnected, connect } = usePlugWallet();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !principal) {
      toast.addToast("Please connect your wallet to create a project.", 'error');
      return;
    }
    if (!title || !description || !goal) {
      toast.addToast("Please fill all required fields.", 'error');
      return;
    }
    setLoading(true);
    try {
      const projectId = await icpService.createProject(title, description, parseFloat(goal));
      toast.addToast("Project created successfully!", 'success');
      navigate(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      toast.addToast("Failed to create project. Please try again.", 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Connect Your Wallet</h2>
        <p className="mb-6 text-slate-400">You need to connect your Plug Wallet to create a new project.</p>
        <button onClick={connect} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
          Connect Plug Wallet
        </button>
      </div>
    );
  }

  const inputClasses = "w-full bg-slate-900 border-slate-700 rounded-md shadow-sm p-3 text-white focus:ring-brand-500 focus:border-brand-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-8 text-white text-center">Launch Your Project</h1>
      <form onSubmit={handleSubmit} className="space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl">
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className={labelClasses}>Project Title</label>
            <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className={inputClasses} required />
          </div>
          <div>
            <label htmlFor="description" className={labelClasses}>Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={5} className={inputClasses} required />
          </div>
          <div>
            <label htmlFor="goal" className={labelClasses}>Funding Goal (in ICP)</label>
            <input type="number" id="goal" value={goal} onChange={e => setGoal(e.target.value)} min="1" className={inputClasses} required />
          </div>
        </div>
        <div className="text-center pt-4">
          <button type="submit" disabled={loading} className="w-full md:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-12 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProjectPage;

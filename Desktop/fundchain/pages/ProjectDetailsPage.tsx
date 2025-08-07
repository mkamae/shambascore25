import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { usePlugWallet } from '../context/PlugWalletContext';
import * as icpService from '../services/icp';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../context/ToastContext';

const CANISTER_PRINCIPAL = 'uxrrr-q7777-77774-qaaaq-cai'; // Update if needed

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [funding, setFunding] = useState<boolean>(false);
  const [fundAmount, setFundAmount] = useState('1');
  const [error, setError] = useState<string>('');
  const { isConnected, connect, principal, sendICP } = usePlugWallet();
  const toast = useToast();

  const fetchProject = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const fetchedProject = await icpService.getProject(Number(id));
      if (fetchedProject) {
        setProject(fetchedProject);
      } else {
        setError("Project not found.");
      }
    } catch (err) {
      setError("Failed to fetch project details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleFundProject = async () => {
    if (!id || !project) return;
    if (!isConnected) {
      toast.addToast('Please connect your wallet first.', 'error');
      await connect();
      return;
    }
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.addToast('Please enter a valid funding amount.', 'error');
      return;
    }
    setFunding(true);
    try {
      // 1. Send ICP to canister principal
      const txId = await sendICP(CANISTER_PRINCIPAL, amount);
      if (!txId) throw new Error('ICP transfer failed');
      // 2. Call canister to record the funding
      await icpService.fundProject(Number(id), amount);
      toast.addToast(`Successfully funded ${amount} ICP!`, 'success');
      await fetchProject();
    } catch (err) {
      toast.addToast("Funding failed. Please try again.", 'error');
      console.error(err);
    } finally {
      setFunding(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading project...</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;
  if (!project) return <div className="text-center py-20 text-slate-400">Project could not be loaded.</div>;

  const isOwner = project.creator === principal;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
        {/* Left Column: Project Details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
            <span className="text-sm font-mono text-slate-400">
              By: {project.creator?.slice(0, 8)}...{project.creator?.slice(-5)}
            </span>
          </div>
          <p className="text-slate-300 mb-10 leading-relaxed">{project.description}</p>
        </div>
        {/* Right Column: Funding Card */}
        <div className="lg:col-span-1 mt-10 lg:mt-0">
          <div className="sticky top-24 bg-slate-800 rounded-xl shadow-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Fund this Project</h2>
            <div className="mb-6">
              <ProgressBar current={project.raised} goal={project.goal} />
              <div className="flex justify-between mt-2 text-sm">
                <div className="text-slate-300">Goal: <span className="font-bold text-white">{project.goal.toLocaleString()} ICP</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="fundAmount" className="block text-sm font-medium text-slate-300 mb-1">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    id="fundAmount"
                    value={fundAmount}
                    onChange={e => setFundAmount(e.target.value)}
                    min="0.1"
                    step="0.1"
                    className="w-full bg-slate-900 border-slate-700 rounded-md shadow-sm p-3 pr-12 text-white focus:ring-brand-500 focus:border-brand-500 transition"
                    disabled={isOwner || funding}
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">ICP</span>
                </div>
              </div>
              <button
                onClick={handleFundProject}
                disabled={funding || isOwner}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed">
                {funding ? 'Processing...' : 'Fund Project'}
              </button>
              {isOwner && <p className="text-center text-xs text-slate-500 mt-2">You cannot fund your own project.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

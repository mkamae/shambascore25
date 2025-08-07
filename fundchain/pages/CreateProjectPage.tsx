import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import * as icpService from '../services/icp';
import { PlusIcon, TrashIcon } from '../components/icons';
import { useToast } from '../context/ToastContext';

const CreateProjectPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [milestones, setMilestones] = useState([{ title: '', description: '' }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { principal, isConnected, connectWallet } = useWallet();
  const toast = useToast();

  const handleMilestoneChange = (index: number, field: 'title' | 'description', value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '', description: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      const newMilestones = milestones.filter((_, i) => i !== index);
      setMilestones(newMilestones);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !principal) {
      toast.addToast("Please connect your wallet to create a project.", 'error');
      return;
    }
    if (!title || !description || !goal || milestones.some(m => !m.title || !m.description)) {
        toast.addToast("Please fill all required fields.", 'error');
        return;
    }
    setLoading(true);

    try {
      const newProject = await icpService.createProject({
        title,
        description,
        goal: parseInt(goal, 10),
        creatorPrincipal: principal,
        milestones,
      });
      toast.addToast("Project created successfully!", 'success');
      navigate(`/project/${newProject.id}`);
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
            <button onClick={connectWallet} className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                Connect Wallet
            </button>
        </div>
    );
  }

  const inputClasses = "w-full bg-slate-900 border-slate-700 rounded-md shadow-sm p-3 text-white focus:ring-brand-500 focus:border-brand-500 transition";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
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

        <div>
          <h2 className="text-xl font-semibold mb-4 text-white">Project Milestones</h2>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-slate-700/50 rounded-lg">
                <span className="text-brand-500 font-bold pt-3 text-lg">{index + 1}</span>
                <div className="flex-grow space-y-3">
                  <input type="text" placeholder="Milestone Title" value={milestone.title} onChange={e => handleMilestoneChange(index, 'title', e.target.value)} className={inputClasses} required />
                  <textarea placeholder="Milestone Description" value={milestone.description} onChange={e => handleMilestoneChange(index, 'description', e.target.value)} rows={2} className={inputClasses} required />
                </div>
                {milestones.length > 1 && (
                  <button type="button" onClick={() => removeMilestone(index)} className="p-2 text-slate-400 hover:text-red-400 transition-colors mt-1">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={addMilestone} className="mt-4 flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold py-2 px-4 border border-brand-500/50 rounded-md transition hover:bg-brand-500/10">
            <PlusIcon className="w-5 h-5" />
            Add Milestone
          </button>
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

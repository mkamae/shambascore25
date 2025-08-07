import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import ProgressBar from './ProgressBar';

interface ProjectCardProps {
  project: Project;
}

const getTimeRemaining = (createdAt: number) => {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const deadline = createdAt + thirtyDays;
    const now = Date.now();
    const remaining = deadline - now;
    
    if (remaining <= 0) return "Ended";

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    return `${days} days left`;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { id, title, description, raised, goal, creatorPrincipal, createdAt } = project;
  const shortDescription = description.length > 100 ? `${description.substring(0, 100)}...` : description;
  const shortPrincipal = `${creatorPrincipal.slice(0, 5)}...${creatorPrincipal.slice(-3)}`;
  const timeRemaining = getTimeRemaining(createdAt);

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg hover:shadow-brand-500/10 overflow-hidden transform hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="p-6 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4 flex-grow">{shortDescription}</p>
        <div className="mt-auto space-y-4">
            <ProgressBar current={raised} goal={goal} />
            <div className="flex justify-between items-center text-xs">
                <span className="font-mono bg-slate-700 text-slate-300 px-2 py-1 rounded">
                    By: {shortPrincipal}
                </span>
                <span className="font-semibold text-slate-400">{timeRemaining}</span>
            </div>
        </div>
      </div>
       <div className="p-4 bg-slate-900/50">
           <Link
                to={`/project/${id}`}
                className="w-full text-center block bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
                Fund Now
            </Link>
       </div>
    </div>
  );
};

export default ProjectCard;

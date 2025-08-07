import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import * as icpService from '../services/icp';
import ProjectCard from '../components/ProjectCard';

const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const fetchedProjects = await icpService.getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <div className="py-20 sm:py-28 text-center bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 tracking-tight">
                Decentralized Funding for <span className="text-brand-500">Bold Ideas</span>.
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-400">
                Launch, discover, and support groundbreaking projects on the world's most powerful decentralized cloud.
            </p>
        </div>
      </div>
    
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Featured Projects</h2>
        
        {loading ? (
          <div className="text-center text-slate-400">Loading projects...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;

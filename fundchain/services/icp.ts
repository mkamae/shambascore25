
import { Project, Milestone } from '../types';
import { MOCK_PROJECTS } from '../constants';

let projects: Project[] = [...MOCK_PROJECTS];

// Simulate the async nature of canister calls
const simulateDelay = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 500));

export const getProjects = async (): Promise<Project[]> => {
  return simulateDelay(projects.sort((a, b) => b.createdAt - a.createdAt));
};

export const getProject = async (id: string): Promise<Project | undefined> => {
  return simulateDelay(projects.find(p => p.id === id));
};

export type CreateProjectData = Omit<Project, 'id' | 'raised' | 'createdAt' | 'milestones'> & {
  milestones: Omit<Milestone, 'id' | 'completed'>[];
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const newProject: Project = {
    ...data,
    id: String(Date.now()),
    raised: 0,
    createdAt: Date.now(),
    milestones: data.milestones.map((m, index) => ({
      ...m,
      id: `m-${Date.now()}-${index}`,
      completed: false,
    })),
  };
  projects.push(newProject);
  return simulateDelay(newProject);
};

export const fundProject = async (id: string, amount: number): Promise<Project | undefined> => {
  const projectIndex = projects.findIndex(p => p.id === id);
  if (projectIndex !== -1) {
    projects[projectIndex].raised += amount;
    return simulateDelay(projects[projectIndex]);
  }
  return simulateDelay(undefined);
};

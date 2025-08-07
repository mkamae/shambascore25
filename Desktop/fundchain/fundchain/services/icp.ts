
import { HttpAgent, Actor } from '@dfinity/agent';
// Import the idlFactory from the generated did.js
import { idlFactory } from '../.dfx/local/canisters/fundchain_backend/service.did.js';

// Local canister ID (update for mainnet as needed)
const canisterId = 'uxrrr-q7777-77774-qaaaq-cai';

// Use Plug's agent if available, otherwise default
const getAgent = () => {
  if (window.ic && window.ic.plug && window.ic.plug.agent) {
    return window.ic.plug.agent;
  }
  return new HttpAgent({ host: 'http://localhost:4943' });
};

export const fundchainActor = () =>
  Actor.createActor(idlFactory, {
    agent: getAgent(),
    canisterId,
  });

// Project type for TypeScript (should match Motoko)
export interface Project {
  id: number;
  creator: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  contributors: [string, number][];
  withdrawn: boolean;
}

export const listProjects = async (): Promise<Project[]> => {
  try {
    const actor = fundchainActor();
    return await actor.listProjects();
  } catch (e) {
    throw new Error('Failed to fetch projects');
  }
};

export const getProject = async (id: number): Promise<Project | null> => {
  try {
    const actor = fundchainActor();
    const result = await actor.getProject(id);
    return result.length ? result[0] : null;
  } catch (e) {
    throw new Error('Failed to fetch project');
  }
};

export const createProject = async (title: string, description: string, goal: number): Promise<number> => {
  try {
    const actor = fundchainActor();
    return await actor.createProject(title, description, goal);
  } catch (e) {
    throw new Error('Failed to create project');
  }
};

export const fundProject = async (id: number, amount: number): Promise<boolean> => {
  try {
    const actor = fundchainActor();
    return await actor.fundProject(id, amount);
  } catch (e) {
    throw new Error('Failed to fund project');
  }
};

export const withdrawFunds = async (id: number): Promise<boolean> => {
  try {
    const actor = fundchainActor();
    return await actor.withdrawFunds(id);
  } catch (e) {
    throw new Error('Failed to withdraw funds');
  }
};

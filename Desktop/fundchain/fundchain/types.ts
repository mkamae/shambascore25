
export interface Milestone {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Project {
  id: string;
  creatorPrincipal: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  milestones: Milestone[];
  createdAt: number;
}

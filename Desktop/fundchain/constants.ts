
import { Project } from './types';

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    creatorPrincipal: 'aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-aaaaa-q',
    title: 'Eco-Friendly Drone Delivery System',
    description: 'Developing a drone delivery network powered by renewable energy to reduce carbon emissions in urban logistics.',
    goal: 500,
    raised: 125,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    milestones: [
      { id: 'm1-1', title: 'Prototype Design', description: 'Finalize the design of the drone prototype.', completed: true },
      { id: 'm1-2', title: 'Build Prototype', description: 'Construct the first working prototype.', completed: false },
      { id: 'm1-3', title: 'Flight Testing', description: 'Conduct initial flight tests in a controlled environment.', completed: false },
    ],
  },
  {
    id: '2',
    creatorPrincipal: 'bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-bbbbb-q',
    title: 'AI-Powered Language Learning App',
    description: 'An innovative mobile app that uses AI to create personalized language learning plans for users.',
    goal: 250,
    raised: 200,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    milestones: [
      { id: 'm2-1', title: 'UI/UX Design Phase', description: 'Design the user interface and experience.', completed: true },
      { id: 'm2-2', title: 'Backend Development', description: 'Develop the AI and backend infrastructure.', completed: true },
      { id: 'm2-3', title: 'App Store Launch', description: 'Launch the app on iOS and Android.', completed: false },
    ],
  },
  {
    id: '3',
    creatorPrincipal: 'ccccc-ccccc-ccccc-ccccc-ccccc-ccccc-ccccc-q',
    title: 'Community Garden & Urban Farm',
    description: 'Establishing a community-run garden to provide fresh, organic produce to local residents and teach sustainable farming.',
    goal: 100,
    raised: 30,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    milestones: [
      { id: 'm3-1', title: 'Secure Land Plot', description: 'Finalize agreement for land use.', completed: false },
      { id: 'm3-2', title: 'Purchase Supplies', description: 'Buy seeds, tools, and soil.', completed: false },
    ],
  },
];

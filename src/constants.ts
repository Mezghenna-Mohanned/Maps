import { AlgorithmInfo } from './types';

export const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: 'astar',
    name: 'A* Algorithm',
    description: 'Uses heuristics to find the shortest path efficiently',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    guaranteesOptimal: true,
  },
  {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    description: 'Guarantees shortest path by exploring uniformly',
    timeComplexity: 'O((V+E)log V)',
    spaceComplexity: 'O(V)',
    guaranteesOptimal: true,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search',
    description: 'Explores level by level, guarantees shortest path',
    timeComplexity: 'O(V+E)',
    spaceComplexity: 'O(V)',
    guaranteesOptimal: true,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search',
    description: 'Explores deeply before backtracking',
    timeComplexity: 'O(V+E)',
    spaceComplexity: 'O(V)',
    guaranteesOptimal: false,
  },
  {
    id: 'greedy',
    name: 'Greedy Best-First',
    description: 'Fastest but may not find optimal path',
    timeComplexity: 'O(b^d)',
    spaceComplexity: 'O(b^d)',
    guaranteesOptimal: false,
  },
];
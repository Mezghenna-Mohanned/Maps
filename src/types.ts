export interface Position {
  lat: number;
  lng: number;
}

export type AlgorithmType = 'dijkstra' | 'astar' | 'bfs' | 'dfs' | 'greedy';

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  guaranteesOptimal: boolean;
}

export interface AlgorithmResult {
  visited: number;
  pathLength: number;
  runtime: number;
}
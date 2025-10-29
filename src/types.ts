export interface MapPosition {
  lat: number;
  lng: number;
}

export type AlgorithmType =
  | 'dijkstra'
  | 'astar'
  | 'bfs'
  | 'dfs'
  | 'greedy'
  | 'jps';

export interface AlgorithmInfo {
  id: AlgorithmType;
  name: string;
  description: string;
  timeComplexity: string;
  spaceComplexity: string;
  guaranteesOptimal: boolean;
}

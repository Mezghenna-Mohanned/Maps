export enum CellType {
  EMPTY = 'empty',
  WALL = 'wall',
  START = 'start',
  END = 'end',
  VISITED = 'visited',
  FRONTIER = 'frontier',
  PATH = 'path',
}

export interface Position {
  row: number;
  col: number;
}

export interface AlgorithmResult {
  path: Position[];
  visited: number;
  runtime: number;
}

export type DrawMode = 'wall' | 'start' | 'end';

export interface GridState {
  cells: CellType[][];
  startPos: Position;
  endPos: Position;
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

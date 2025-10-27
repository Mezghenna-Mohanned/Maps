import { CellType, Position, AlgorithmResult } from '../types';
import { getNeighbors } from './grid';

class PriorityQueue<T> {
  private items: { element: T; priority: number }[] = [];

  enqueue(element: T, priority: number): void {
    const queueElement = { element, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (queueElement.priority < this.items[i].priority) {
        this.items.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(queueElement);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

const heuristic = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

const posToKey = (pos: Position): string => `${pos.row},${pos.col}`;

const reconstructPath = (
  cameFrom: Map<string, Position>,
  current: Position
): Position[] => {
  const path: Position[] = [];
  let currentPos = current;

  while (cameFrom.has(posToKey(currentPos))) {
    path.unshift(currentPos);
    currentPos = cameFrom.get(posToKey(currentPos))!;
  }

  return path;
};

export type VisualizationCallback = (
  cells: CellType[][],
  stats?: { visited: number; pathLength: number }
) => void;

export const dijkstra = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const distances = new Map<string, number>();
  const cameFrom = new Map<string, Position>();
  const pq = new PriorityQueue<Position>();
  const visited = new Set<string>();
  const newCells = cells.map((row) => [...row]);

  const startKey = posToKey(start);
  distances.set(startKey, 0);
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = posToKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.row !== start.row || current.col !== start.col) {
      newCells[current.row][current.col] = CellType.VISITED;
      onVisualize(newCells, { visited: visited.size, pathLength: 0 });
      await new Promise((resolve) => setTimeout(resolve, 101 - speed));
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      return {
        path,
        visited: visited.size,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(newCells, current);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);
      const newDistance = distances.get(currentKey)! + 1;

      if (!distances.has(neighborKey) || newDistance < distances.get(neighborKey)!) {
        distances.set(neighborKey, newDistance);
        cameFrom.set(neighborKey, current);
        pq.enqueue(neighbor, newDistance);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          newCells[neighbor.row][neighbor.col] = CellType.FRONTIER;
        }
      }
    }
  }

  return {
    path: [],
    visited: visited.size,
    runtime: performance.now() - startTime,
  };
};

export const astar = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, Position>();
  const pq = new PriorityQueue<Position>();
  const visited = new Set<string>();
  const newCells = cells.map((row) => [...row]);

  const startKey = posToKey(start);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));
  pq.enqueue(start, fScore.get(startKey)!);

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = posToKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.row !== start.row || current.col !== start.col) {
      newCells[current.row][current.col] = CellType.VISITED;
      onVisualize(newCells, { visited: visited.size, pathLength: 0 });
      await new Promise((resolve) => setTimeout(resolve, 101 - speed));
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      return {
        path,
        visited: visited.size,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(newCells, current);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);
      const tentativeGScore = gScore.get(currentKey)! + 1;

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)!) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        const f = tentativeGScore + heuristic(neighbor, end);
        fScore.set(neighborKey, f);
        pq.enqueue(neighbor, f);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          newCells[neighbor.row][neighbor.col] = CellType.FRONTIER;
        }
      }
    }
  }

  return {
    path: [],
    visited: visited.size,
    runtime: performance.now() - startTime,
  };
};

export const bfs = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const queue: Position[] = [start];
  const visited = new Set<string>([posToKey(start)]);
  const cameFrom = new Map<string, Position>();
  const newCells = cells.map((row) => [...row]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.row !== start.row || current.col !== start.col) {
      newCells[current.row][current.col] = CellType.VISITED;
      onVisualize(newCells, { visited: visited.size, pathLength: 0 });
      await new Promise((resolve) => setTimeout(resolve, 101 - speed));
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      return {
        path,
        visited: visited.size,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(newCells, current);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          newCells[neighbor.row][neighbor.col] = CellType.FRONTIER;
        }
      }
    }
  }

  return {
    path: [],
    visited: visited.size,
    runtime: performance.now() - startTime,
  };
};

export const dfs = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const stack: Position[] = [start];
  const visited = new Set<string>([posToKey(start)]);
  const cameFrom = new Map<string, Position>();
  const newCells = cells.map((row) => [...row]);

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current.row !== start.row || current.col !== start.col) {
      newCells[current.row][current.col] = CellType.VISITED;
      onVisualize(newCells, { visited: visited.size, pathLength: 0 });
      await new Promise((resolve) => setTimeout(resolve, 101 - speed));
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      return {
        path,
        visited: visited.size,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(newCells, current);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        stack.push(neighbor);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          newCells[neighbor.row][neighbor.col] = CellType.FRONTIER;
        }
      }
    }
  }

  return {
    path: [],
    visited: visited.size,
    runtime: performance.now() - startTime,
  };
};

export const greedyBestFirst = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const pq = new PriorityQueue<Position>();
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();
  const newCells = cells.map((row) => [...row]);

  pq.enqueue(start, heuristic(start, end));

  while (!pq.isEmpty()) {
    const current = pq.dequeue()!;
    const currentKey = posToKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.row !== start.row || current.col !== start.col) {
      newCells[current.row][current.col] = CellType.VISITED;
      onVisualize(newCells, { visited: visited.size, pathLength: 0 });
      await new Promise((resolve) => setTimeout(resolve, 101 - speed));
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      return {
        path,
        visited: visited.size,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(newCells, current);
    for (const neighbor of neighbors) {
      const neighborKey = posToKey(neighbor);
      if (!visited.has(neighborKey)) {
        cameFrom.set(neighborKey, current);
        pq.enqueue(neighbor, heuristic(neighbor, end));

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          newCells[neighbor.row][neighbor.col] = CellType.FRONTIER;
        }
      }
    }
  }

  return {
    path: [],
    visited: visited.size,
    runtime: performance.now() - startTime,
  };
};

export const jumpPointSearch = async (
  cells: CellType[][],
  start: Position,
  end: Position,
  onVisualize: VisualizationCallback,
  speed: number
): Promise<AlgorithmResult> => {
  return astar(cells, start, end, onVisualize, speed);
};

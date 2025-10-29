import { Position, AlgorithmResult } from '../types';

export class PriorityQueue<T> {
  private items: Array<{ element: T; priority: number }> = [];

  enqueue(element: T, priority: number): void {
    const item = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift()?.element;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export const heuristic = (a: Position, b: Position): number => {
  return Math.abs(a.lat - b.lat) + Math.abs(a.lng - b.lng);
};

export const posKey = (pos: Position): string => 
  `${pos.lat.toFixed(6)},${pos.lng.toFixed(6)}`;

export const getNeighbors = (
  pos: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
): Position[] => {
  const neighbors: Position[] = [];
  const step = 0.001;
  const directions = [
    { lat: step, lng: 0 },
    { lat: -step, lng: 0 },
    { lat: 0, lng: step },
    { lat: 0, lng: -step },
    { lat: step, lng: step },
    { lat: step, lng: -step },
    { lat: -step, lng: step },
    { lat: -step, lng: -step },
  ];

  for (const dir of directions) {
    const newPos = {
      lat: parseFloat((pos.lat + dir.lat).toFixed(6)),
      lng: parseFloat((pos.lng + dir.lng).toFixed(6)),
    };
    
    if (
      newPos.lat >= bounds.minLat &&
      newPos.lat <= bounds.maxLat &&
      newPos.lng >= bounds.minLng &&
      newPos.lng <= bounds.maxLng &&
      !obstacles.has(posKey(newPos))
    ) {
      neighbors.push(newPos);
    }
  }
  return neighbors;
};

export const runAStar = async (
  start: Position,
  end: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speed: number,
  onVisited: (pos: Position) => void,
  onPath: (path: Position[]) => void,
  shouldStop: () => boolean
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const openSet = new PriorityQueue<Position>();
  const cameFrom = new Map<string, Position>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const visited = new Set<string>();

  const startKey = posKey(start);
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));
  openSet.enqueue(start, fScore.get(startKey)!);

  while (!openSet.isEmpty()) {
    if (shouldStop()) break;

    const current = openSet.dequeue()!;
    const currentKey = posKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    onVisited(current);

    await new Promise(resolve => setTimeout(resolve, Math.max(1, 101 - speed)));

    if (Math.abs(current.lat - end.lat) < 0.0005 && Math.abs(current.lng - end.lng) < 0.0005) {
      const path: Position[] = [];
      let curr = current;
      while (cameFrom.has(posKey(curr))) {
        path.unshift(curr);
        curr = cameFrom.get(posKey(curr))!;
      }
      path.unshift(start);
      onPath(path);
      return {
        visited: visited.size,
        pathLength: path.length,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(current, obstacles, bounds);
    for (const neighbor of neighbors) {
      const neighborKey = posKey(neighbor);
      const tentativeG = gScore.get(currentKey)! + heuristic(current, neighbor);

      if (!gScore.has(neighborKey) || tentativeG < gScore.get(neighborKey)!) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeG);
        const f = tentativeG + heuristic(neighbor, end);
        fScore.set(neighborKey, f);
        openSet.enqueue(neighbor, f);
      }
    }
  }

  return {
    visited: visited.size,
    pathLength: 0,
    runtime: performance.now() - startTime,
  };
};

export const runDijkstra = async (
  start: Position,
  end: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speed: number,
  onVisited: (pos: Position) => void,
  onPath: (path: Position[]) => void,
  shouldStop: () => boolean
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const openSet = new PriorityQueue<Position>();
  const cameFrom = new Map<string, Position>();
  const distances = new Map<string, number>();
  const visited = new Set<string>();

  const startKey = posKey(start);
  distances.set(startKey, 0);
  openSet.enqueue(start, 0);

  while (!openSet.isEmpty()) {
    if (shouldStop()) break;

    const current = openSet.dequeue()!;
    const currentKey = posKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    onVisited(current);

    await new Promise(resolve => setTimeout(resolve, Math.max(1, 101 - speed)));

    if (Math.abs(current.lat - end.lat) < 0.0005 && Math.abs(current.lng - end.lng) < 0.0005) {
      const path: Position[] = [];
      let curr = current;
      while (cameFrom.has(posKey(curr))) {
        path.unshift(curr);
        curr = cameFrom.get(posKey(curr))!;
      }
      path.unshift(start);
      onPath(path);
      return {
        visited: visited.size,
        pathLength: path.length,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(current, obstacles, bounds);
    for (const neighbor of neighbors) {
      const neighborKey = posKey(neighbor);
      const newDistance = distances.get(currentKey)! + 1;

      if (!distances.has(neighborKey) || newDistance < distances.get(neighborKey)!) {
        distances.set(neighborKey, newDistance);
        cameFrom.set(neighborKey, current);
        openSet.enqueue(neighbor, newDistance);
      }
    }
  }

  return {
    visited: visited.size,
    pathLength: 0,
    runtime: performance.now() - startTime,
  };
};

export const runBFS = async (
  start: Position,
  end: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speed: number,
  onVisited: (pos: Position) => void,
  onPath: (path: Position[]) => void,
  shouldStop: () => boolean
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const queue: Position[] = [start];
  const visited = new Set<string>([posKey(start)]);
  const cameFrom = new Map<string, Position>();

  while (queue.length > 0) {
    if (shouldStop()) break;

    const current = queue.shift()!;
    onVisited(current);

    await new Promise(resolve => setTimeout(resolve, Math.max(1, 101 - speed)));

    if (Math.abs(current.lat - end.lat) < 0.0005 && Math.abs(current.lng - end.lng) < 0.0005) {
      const path: Position[] = [];
      let curr = current;
      while (cameFrom.has(posKey(curr))) {
        path.unshift(curr);
        curr = cameFrom.get(posKey(curr))!;
      }
      path.unshift(start);
      onPath(path);
      return {
        visited: visited.size,
        pathLength: path.length,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(current, obstacles, bounds);
    for (const neighbor of neighbors) {
      const neighborKey = posKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);
      }
    }
  }

  return {
    visited: visited.size,
    pathLength: 0,
    runtime: performance.now() - startTime,
  };
};

export const runDFS = async (
  start: Position,
  end: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speed: number,
  onVisited: (pos: Position) => void,
  onPath: (path: Position[]) => void,
  shouldStop: () => boolean
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const stack: Position[] = [start];
  const visited = new Set<string>([posKey(start)]);
  const cameFrom = new Map<string, Position>();

  while (stack.length > 0) {
    if (shouldStop()) break;

    const current = stack.pop()!;
    onVisited(current);

    await new Promise(resolve => setTimeout(resolve, Math.max(1, 101 - speed)));

    if (Math.abs(current.lat - end.lat) < 0.0005 && Math.abs(current.lng - end.lng) < 0.0005) {
      const path: Position[] = [];
      let curr = current;
      while (cameFrom.has(posKey(curr))) {
        path.unshift(curr);
        curr = cameFrom.get(posKey(curr))!;
      }
      path.unshift(start);
      onPath(path);
      return {
        visited: visited.size,
        pathLength: path.length,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(current, obstacles, bounds);
    for (const neighbor of neighbors) {
      const neighborKey = posKey(neighbor);
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        stack.push(neighbor);
      }
    }
  }

  return {
    visited: visited.size,
    pathLength: 0,
    runtime: performance.now() - startTime,
  };
};

export const runGreedy = async (
  start: Position,
  end: Position,
  obstacles: Set<string>,
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
  speed: number,
  onVisited: (pos: Position) => void,
  onPath: (path: Position[]) => void,
  shouldStop: () => boolean
): Promise<AlgorithmResult> => {
  const startTime = performance.now();
  const openSet = new PriorityQueue<Position>();
  const visited = new Set<string>();
  const cameFrom = new Map<string, Position>();

  openSet.enqueue(start, heuristic(start, end));

  while (!openSet.isEmpty()) {
    if (shouldStop()) break;

    const current = openSet.dequeue()!;
    const currentKey = posKey(current);

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);
    onVisited(current);

    await new Promise(resolve => setTimeout(resolve, Math.max(1, 101 - speed)));

    if (Math.abs(current.lat - end.lat) < 0.0005 && Math.abs(current.lng - end.lng) < 0.0005) {
      const path: Position[] = [];
      let curr = current;
      while (cameFrom.has(posKey(curr))) {
        path.unshift(curr);
        curr = cameFrom.get(posKey(curr))!;
      }
      path.unshift(start);
      onPath(path);
      return {
        visited: visited.size,
        pathLength: path.length,
        runtime: performance.now() - startTime,
      };
    }

    const neighbors = getNeighbors(current, obstacles, bounds);
    for (const neighbor of neighbors) {
      const neighborKey = posKey(neighbor);
      if (!visited.has(neighborKey)) {
        cameFrom.set(neighborKey, current);
        openSet.enqueue(neighbor, heuristic(neighbor, end));
      }
    }
  }

  return {
    visited: visited.size,
    pathLength: 0,
    runtime: performance.now() - startTime,
  };
};
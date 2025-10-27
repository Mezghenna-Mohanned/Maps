import { CellType } from './grid.js';

class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
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

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

function heuristic(pos1, pos2) {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
}

function reconstructPath(cameFrom, current) {
  const path = [];
  while (cameFrom.has(`${current.row},${current.col}`)) {
    path.unshift(current);
    current = cameFrom.get(`${current.row},${current.col}`);
  }
  return path;
}

export async function dijkstra(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;
  const end = grid.endPos;

  const distances = new Map();
  const cameFrom = new Map();
  const pq = new PriorityQueue();
  const visited = new Set();

  const startKey = `${start.row},${start.col}`;
  distances.set(startKey, 0);
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { element: current } = pq.dequeue();
    const currentKey = `${current.row},${current.col}`;

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.row !== start.row || current.col !== start.col) {
      grid.setCellType(current.row, current.col, CellType.VISITED);
      await visualizer.visualizeStep();
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      const runtime = performance.now() - startTime;
      return { path, visited: visited.size, runtime };
    }

    const neighbors = grid.getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      const newDistance = distances.get(currentKey) + 1;

      if (!distances.has(neighborKey) || newDistance < distances.get(neighborKey)) {
        distances.set(neighborKey, newDistance);
        cameFrom.set(neighborKey, current);
        pq.enqueue(neighbor, newDistance);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

export async function astar(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;
  const end = grid.endPos;

  const gScore = new Map();
  const fScore = new Map();
  const cameFrom = new Map();
  const pq = new PriorityQueue();
  const visited = new Set();

  const startKey = `${start.row},${start.col}`;
  gScore.set(startKey, 0);
  fScore.set(startKey, heuristic(start, end));
  pq.enqueue(start, fScore.get(startKey));

  while (!pq.isEmpty()) {
    const { element: current } = pq.dequeue();
    const currentKey = `${current.row},${current.col}`;

    if (visited.has(currentKey)) continue;
    visited.add(currentKey);

    if (current.row !== start.row || current.col !== start.col) {
      grid.setCellType(current.row, current.col, CellType.VISITED);
      await visualizer.visualizeStep();
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      const runtime = performance.now() - startTime;
      return { path, visited: visited.size, runtime };
    }

    const neighbors = grid.getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      const tentativeGScore = gScore.get(currentKey) + 1;

      if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
        cameFrom.set(neighborKey, current);
        gScore.set(neighborKey, tentativeGScore);
        const f = tentativeGScore + heuristic(neighbor, end);
        fScore.set(neighborKey, f);
        pq.enqueue(neighbor, f);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

export async function bfs(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;
  const end = grid.endPos;

  const queue = [start];
  const visited = new Set([`${start.row},${start.col}`]);
  const cameFrom = new Map();

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.row !== start.row || current.col !== start.col) {
      grid.setCellType(current.row, current.col, CellType.VISITED);
      await visualizer.visualizeStep();
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      const runtime = performance.now() - startTime;
      return { path, visited: visited.size, runtime };
    }

    const neighbors = grid.getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        queue.push(neighbor);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

export async function dfs(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;
  const end = grid.endPos;

  const stack = [start];
  const visited = new Set([`${start.row},${start.col}`]);
  const cameFrom = new Map();

  while (stack.length > 0) {
    const current = stack.pop();

    if (current.row !== start.row || current.col !== start.col) {
      grid.setCellType(current.row, current.col, CellType.VISITED);
      await visualizer.visualizeStep();
    }

    if (current.row === end.row && current.col === end.col) {
      const path = reconstructPath(cameFrom, current);
      const runtime = performance.now() - startTime;
      return { path, visited: visited.size, runtime };
    }

    const neighbors = grid.getNeighbors(current.row, current.col);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        cameFrom.set(neighborKey, current);
        stack.push(neighbor);

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

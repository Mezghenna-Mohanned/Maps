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

export async function greedyBestFirst(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;
  const end = grid.endPos;

  const pq = new PriorityQueue();
  const visited = new Set();
  const cameFrom = new Map();

  pq.enqueue(start, heuristic(start, end));

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
      if (!visited.has(neighborKey)) {
        cameFrom.set(neighborKey, current);
        pq.enqueue(neighbor, heuristic(neighbor, end));

        if (neighbor.row !== end.row || neighbor.col !== end.col) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

export async function jumpPointSearch(grid, visualizer) {
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

  function jump(current, direction) {
    const newRow = current.row + direction.dr;
    const newCol = current.col + direction.dc;

    if (!grid.isWalkable(newRow, newCol)) {
      return null;
    }

    const next = { row: newRow, col: newCol };

    if (next.row === end.row && next.col === end.col) {
      return next;
    }

    if (direction.dr !== 0 && direction.dc !== 0) {
      if ((grid.isWalkable(next.row - direction.dr, next.col) && !grid.isWalkable(next.row - direction.dr, next.col - direction.dc)) ||
          (grid.isWalkable(next.row, next.col - direction.dc) && !grid.isWalkable(next.row - direction.dr, next.col - direction.dc))) {
        return next;
      }
    } else {
      if (direction.dr !== 0) {
        if ((grid.isWalkable(next.row, next.col + 1) && !grid.isWalkable(next.row - direction.dr, next.col + 1)) ||
            (grid.isWalkable(next.row, next.col - 1) && !grid.isWalkable(next.row - direction.dr, next.col - 1))) {
          return next;
        }
      } else {
        if ((grid.isWalkable(next.row + 1, next.col) && !grid.isWalkable(next.row + 1, next.col - direction.dc)) ||
            (grid.isWalkable(next.row - 1, next.col) && !grid.isWalkable(next.row - 1, next.col - direction.dc))) {
          return next;
        }
      }
    }

    return jump(next, direction);
  }

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

    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
      { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ];

    for (const dir of directions) {
      const neighbor = jump(current, dir);
      if (neighbor) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        const tentativeGScore = gScore.get(currentKey) + heuristic(current, neighbor);

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
  }

  const runtime = performance.now() - startTime;
  return { path: [], visited: visited.size, runtime };
}

export async function minimumSpanningTree(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;

  const visited = new Set();
  const edges = new PriorityQueue();
  const mstEdges = [];

  visited.add(`${start.row},${start.col}`);
  grid.setCellType(start.row, start.col, CellType.VISITED);

  const neighbors = grid.getNeighbors(start.row, start.col);
  for (const neighbor of neighbors) {
    edges.enqueue({ from: start, to: neighbor }, 1);
  }

  while (!edges.isEmpty() && visited.size < grid.rows * grid.cols) {
    const { element: edge } = edges.dequeue();
    const toKey = `${edge.to.row},${edge.to.col}`;

    if (visited.has(toKey)) continue;

    visited.add(toKey);
    mstEdges.push(edge);

    grid.setCellType(edge.to.row, edge.to.col, CellType.VISITED);
    await visualizer.visualizeStep();

    const newNeighbors = grid.getNeighbors(edge.to.row, edge.to.col);
    for (const neighbor of newNeighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(neighborKey)) {
        edges.enqueue({ from: edge.to, to: neighbor }, 1);
        if (grid.getCellType(neighbor.row, neighbor.col) !== CellType.START &&
            grid.getCellType(neighbor.row, neighbor.col) !== CellType.END) {
          grid.setCellType(neighbor.row, neighbor.col, CellType.FRONTIER);
        }
      }
    }
  }

  const runtime = performance.now() - startTime;
  return { path: mstEdges, visited: visited.size, runtime };
}

export async function travellingSalesman(grid, visualizer) {
  const startTime = performance.now();
  const start = grid.startPos;

  const points = [start];
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      if (Math.random() < 0.05 && grid.isWalkable(row, col)) {
        points.push({ row, col });
        if (points.length >= 8) break;
      }
    }
    if (points.length >= 8) break;
  }

  for (const point of points) {
    if (point.row !== start.row || point.col !== start.col) {
      grid.setCellType(point.row, point.col, CellType.FRONTIER);
    }
  }
  await visualizer.visualizeStep();

  const n = points.length;
  const visited = new Array(n).fill(false);
  const path = [0];
  visited[0] = true;
  let current = 0;

  for (let i = 1; i < n; i++) {
    let nearest = -1;
    let minDist = Infinity;

    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const dist = heuristic(points[current], points[j]);
        if (dist < minDist) {
          minDist = dist;
          nearest = j;
        }
      }
    }

    if (nearest !== -1) {
      visited[nearest] = true;
      path.push(nearest);

      const from = points[current];
      const to = points[nearest];
      const steps = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col));

      for (let step = 1; step <= steps; step++) {
        const row = Math.round(from.row + (to.row - from.row) * step / steps);
        const col = Math.round(from.col + (to.col - from.col) * step / steps);
        if (grid.getCellType(row, col) !== CellType.FRONTIER) {
          grid.setCellType(row, col, CellType.VISITED);
        }
      }
      await visualizer.visualizeStep();

      current = nearest;
    }
  }

  const pathCoords = path.map(i => points[i]);
  const runtime = performance.now() - startTime;
  return { path: pathCoords, visited: n, runtime };
}

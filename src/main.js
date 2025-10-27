import { Grid, GRID_ROWS, GRID_COLS } from './grid.js';
import { Visualizer } from './visualizer.js';
import { dijkstra, astar, bfs, dfs } from './algorithms.js';
import { greedyBestFirst, jumpPointSearch, minimumSpanningTree, travellingSalesman } from './advancedAlgorithms.js';

const grid = new Grid(GRID_ROWS, GRID_COLS);
const visualizer = new Visualizer(grid);

const algorithmSelect = document.getElementById('algorithm-select');
const runBtn = document.getElementById('run-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const clearWallsBtn = document.getElementById('clear-walls-btn');
const randomWallsBtn = document.getElementById('random-walls-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');
const drawModeRadios = document.querySelectorAll('input[name="draw-mode"]');

const nodesVisitedEl = document.getElementById('nodes-visited');
const pathLengthEl = document.getElementById('path-length');
const runtimeEl = document.getElementById('runtime');

const algorithms = {
  dijkstra,
  astar,
  bfs,
  dfs,
  greedy: greedyBestFirst,
  jps: jumpPointSearch,
  mst: minimumSpanningTree,
  tsp: travellingSalesman
};

let isRunning = false;

runBtn.addEventListener('click', async () => {
  if (isRunning) return;

  grid.clearVisualization();
  visualizer.render();
  resetStats();

  const algorithmName = algorithmSelect.value;
  const algorithm = algorithms[algorithmName];

  if (!algorithm) {
    alert('Algorithm not implemented yet!');
    return;
  }

  isRunning = true;
  visualizer.start();
  runBtn.disabled = true;
  pauseBtn.disabled = false;
  resetBtn.disabled = false;

  try {
    const result = await algorithm(grid, visualizer);

    if (visualizer.isRunning && result.path.length > 0) {
      await visualizer.visualizePath(result.path);
    }

    updateStats(result.visited, result.path.length, result.runtime);
  } catch (error) {
    console.error('Algorithm error:', error);
  }

  isRunning = false;
  visualizer.stop();
  runBtn.disabled = false;
  pauseBtn.disabled = true;
});

pauseBtn.addEventListener('click', () => {
  if (visualizer.isPaused) {
    visualizer.resume();
    pauseBtn.textContent = 'Pause';
  } else {
    visualizer.pause();
    pauseBtn.textContent = 'Resume';
  }
});

resetBtn.addEventListener('click', () => {
  visualizer.reset();
  isRunning = false;
  runBtn.disabled = false;
  pauseBtn.disabled = true;
  pauseBtn.textContent = 'Pause';
  resetStats();
});

clearWallsBtn.addEventListener('click', () => {
  grid.clearWalls();
  visualizer.render();
});

randomWallsBtn.addEventListener('click', () => {
  grid.generateRandomWalls(0.3);
  visualizer.render();
});

speedSlider.addEventListener('input', (e) => {
  const speed = parseInt(e.target.value);
  visualizer.setSpeed(speed);
  speedValue.textContent = speed;
});

drawModeRadios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    grid.drawMode = e.target.value;
  });
});

function resetStats() {
  nodesVisitedEl.textContent = '0';
  pathLengthEl.textContent = '0';
  runtimeEl.textContent = '0ms';
}

function updateStats(visited, pathLength, runtime) {
  nodesVisitedEl.textContent = visited;
  pathLengthEl.textContent = pathLength;
  runtimeEl.textContent = `${runtime.toFixed(2)}ms`;
}

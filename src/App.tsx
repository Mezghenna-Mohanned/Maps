import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid } from './components/Grid';
import { Controls } from './components/Controls';
import { CellType, DrawMode, AlgorithmType } from './types';
import {
  initializeGrid,
  clearVisualization,
  generateRandomWalls,
  clearWalls,
  GRID_ROWS,
  GRID_COLS,
} from './utils/grid';
import {
  dijkstra,
  astar,
  bfs,
  dfs,
  greedyBestFirst,
  jumpPointSearch,
} from './utils/algorithms';

const algorithmMap = {
  dijkstra,
  astar,
  bfs,
  dfs,
  greedy: greedyBestFirst,
  jps: jumpPointSearch,
};

function App() {
  const [gridState, setGridState] = useState(initializeGrid());
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('astar');
  const [speed, setSpeed] = useState(50);
  const [drawMode, setDrawMode] = useState<DrawMode>('wall');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    nodesVisited: 0,
    pathLength: 0,
    runtime: 0,
  });

  const isRunningRef = useRef(false);

  const handleCellInteraction = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;

      setGridState((prev) => {
        const newCells = prev.cells.map((r) => [...r]);
        const currentCell = newCells[row][col];

        if (drawMode === 'wall') {
          if (currentCell === CellType.EMPTY) {
            newCells[row][col] = CellType.WALL;
          } else if (currentCell === CellType.WALL) {
            newCells[row][col] = CellType.EMPTY;
          }
          return { ...prev, cells: newCells };
        } else if (drawMode === 'start') {
          if (currentCell !== CellType.END) {
            newCells[prev.startPos.row][prev.startPos.col] = CellType.EMPTY;
            newCells[row][col] = CellType.START;
            return { ...prev, cells: newCells, startPos: { row, col } };
          }
        } else if (drawMode === 'end') {
          if (currentCell !== CellType.START) {
            newCells[prev.endPos.row][prev.endPos.col] = CellType.EMPTY;
            newCells[row][col] = CellType.END;
            return { ...prev, cells: newCells, endPos: { row, col } };
          }
        }

        return prev;
      });
    },
    [drawMode, isRunning]
  );

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    setGridState((prev) => ({
      ...prev,
      cells: clearVisualization(prev.cells),
    }));

    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });
    setIsRunning(true);
    setIsPaused(false);
    isRunningRef.current = true;

    const algorithm = algorithmMap[selectedAlgorithm];

    try {
      const result = await algorithm(
        gridState.cells,
        gridState.startPos,
        gridState.endPos,
        (newCells, partialStats) => {
          if (!isRunningRef.current) return;
          setGridState((prev) => ({ ...prev, cells: newCells }));
          if (partialStats) {
            setStats((prev) => ({ ...prev, ...partialStats }));
          }
        },
        speed
      );

      if (!isRunningRef.current) return;

      for (const pos of result.path) {
        if (!isRunningRef.current) break;

        setGridState((prev) => {
          const newCells = prev.cells.map((r) => [...r]);
          newCells[pos.row][pos.col] = CellType.PATH;
          return { ...prev, cells: newCells };
        });

        await new Promise((resolve) => setTimeout(resolve, (101 - speed) / 2));
      }

      setStats({
        nodesVisited: result.visited,
        pathLength: result.path.length,
        runtime: result.runtime,
      });
    } catch (error) {
      console.error('Algorithm error:', error);
    } finally {
      setIsRunning(false);
      isRunningRef.current = false;
    }
  }, [gridState, selectedAlgorithm, speed, isRunning]);

  const handlePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setGridState(initializeGrid());
    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });
  }, []);

  const handleClearWalls = useCallback(() => {
    if (isRunning) return;
    setGridState((prev) => ({
      ...prev,
      cells: clearWalls(prev.cells),
    }));
  }, [isRunning]);

  const handleRandomWalls = useCallback(() => {
    if (isRunning) return;
    setGridState((prev) => ({
      ...prev,
      cells: generateRandomWalls(prev.cells, prev.startPos, prev.endPos, 0.25),
    }));
  }, [isRunning]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Pathfinding Visualizer
          </h1>
          <p className="text-dark-600 text-lg">
            Explore and compare pathfinding algorithms in real-time
          </p>
        </motion.header>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Controls
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmChange={setSelectedAlgorithm}
              speed={speed}
              onSpeedChange={setSpeed}
              drawMode={drawMode}
              onDrawModeChange={setDrawMode}
              isRunning={isRunning}
              isPaused={isPaused}
              onRun={handleRun}
              onPause={handlePause}
              onReset={handleReset}
              onClearWalls={handleClearWalls}
              onRandomWalls={handleRandomWalls}
              stats={stats}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex-1 flex justify-center"
          >
            <Grid
              cells={gridState.cells}
              onCellInteraction={handleCellInteraction}
              isRunning={isRunning}
            />
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12 text-dark-500 text-sm"
        >
          <p>Click and drag to draw walls • Select start/end mode to move markers</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;

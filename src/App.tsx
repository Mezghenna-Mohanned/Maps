import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapView } from './components/MapView';
import { Controls } from './components/Controls';
import { AlgorithmType, MapPosition } from './types';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('astar');
  const [speed, setSpeed] = useState(50);
  const [startPoint, setStartPoint] = useState<MapPosition>({ lat: 40.7128, lng: -74.0060 });
  const [endPoint, setEndPoint] = useState<MapPosition>({ lat: 40.7580, lng: -73.9855 });
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({
    nodesVisited: 0,
    pathLength: 0,
    runtime: 0,
  });
  const [visitedNodes, setVisitedNodes] = useState<MapPosition[]>([]);
  const [pathNodes, setPathNodes] = useState<MapPosition[]>([]);

  const isRunningRef = useRef(false);

  const handleRun = useCallback(() => {
    if (isRunning) return;

    setVisitedNodes([]);
    setPathNodes([]);
    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });
    setIsRunning(true);
    isRunningRef.current = true;

    const startTime = performance.now();

    const latDiff = endPoint.lat - startPoint.lat;
    const lngDiff = endPoint.lng - startPoint.lng;
    const steps = 50;

    const visited: MapPosition[] = [];
    const path: MapPosition[] = [];

    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const spread = Math.sin(progress * Math.PI) * 0.02;

      for (let j = -2; j <= 2; j++) {
        visited.push({
          lat: startPoint.lat + latDiff * progress + spread * j,
          lng: startPoint.lng + lngDiff * progress + (Math.random() - 0.5) * 0.01,
        });
      }

      path.push({
        lat: startPoint.lat + latDiff * progress,
        lng: startPoint.lng + lngDiff * progress,
      });
    }

    let currentIndex = 0;
    const animationInterval = setInterval(() => {
      if (!isRunningRef.current) {
        clearInterval(animationInterval);
        return;
      }

      if (currentIndex < visited.length) {
        setVisitedNodes((prev) => [...prev, visited[currentIndex]]);

        const pathIndex = Math.floor((currentIndex / visited.length) * path.length);
        if (pathIndex < path.length && pathIndex > 0) {
          setPathNodes(path.slice(0, pathIndex));
        }

        setStats({
          nodesVisited: currentIndex + 1,
          pathLength: pathIndex,
          runtime: performance.now() - startTime,
        });

        currentIndex++;
      } else {
        clearInterval(animationInterval);
        setPathNodes(path);
        setStats({
          nodesVisited: visited.length,
          pathLength: path.length,
          runtime: performance.now() - startTime,
        });
        setIsRunning(false);
        isRunningRef.current = false;
      }
    }, (101 - speed) * 2);
  }, [startPoint, endPoint, speed, isRunning]);

  const handleReset = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    setVisitedNodes([]);
    setPathNodes([]);
    setStartPoint({ lat: 40.7128, lng: -74.0060 });
    setEndPoint({ lat: 40.7580, lng: -73.9855 });
    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });
  }, []);

  return (
    <div className="h-screen flex flex-col bg-slate-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 border-b border-slate-700 px-6 py-4 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Real-World Pathfinding Visualizer
            </h1>
            <p className="text-slate-400 text-sm">
              Visualize pathfinding algorithms on an interactive map
            </p>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 flex overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="w-96 bg-slate-800 border-r border-slate-700 overflow-y-auto"
        >
          <Controls
            selectedAlgorithm={selectedAlgorithm}
            onAlgorithmChange={setSelectedAlgorithm}
            speed={speed}
            onSpeedChange={setSpeed}
            isRunning={isRunning}
            onRun={handleRun}
            onReset={handleReset}
            stats={stats}
            startPoint={startPoint}
            endPoint={endPoint}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-1 relative"
        >
          <MapView
            startPoint={startPoint}
            endPoint={endPoint}
            onStartPointChange={setStartPoint}
            onEndPointChange={setEndPoint}
            visitedNodes={visitedNodes}
            pathNodes={pathNodes}
            isRunning={isRunning}
          />
        </motion.div>
      </div>
    </div>
  );
}

export default App;

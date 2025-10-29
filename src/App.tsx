import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Play, RotateCcw, Info, Zap, MapPin, Move } from 'lucide-react';
import { Position, AlgorithmType } from './types';
import { ALGORITHMS } from './constants';
import { runAStar, runDijkstra, runBFS, runDFS, runGreedy } from './utils/pathfinding';

export default function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('astar');
  const [speed, setSpeed] = useState(50);
  const [startPoint, setStartPoint] = useState<Position>({ lat: 40.7128, lng: -74.006 });
  const [endPoint, setEndPoint] = useState<Position>({ lat: 40.758, lng: -73.9855 });
  const [isRunning, setIsRunning] = useState(false);
  const [visitedNodes, setVisitedNodes] = useState<Position[]>([]);
  const [pathNodes, setPathNodes] = useState<Position[]>([]);
  const [stats, setStats] = useState({ nodesVisited: 0, pathLength: 0, runtime: 0 });
  const [dragMode, setDragMode] = useState<'start' | 'end' | null>(null);
  const [obstacles] = useState<Set<string>>(new Set());

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRef = useRef(false);

  const bounds = {
    minLat: Math.min(startPoint.lat, endPoint.lat) - 0.02,
    maxLat: Math.max(startPoint.lat, endPoint.lat) + 0.02,
    minLng: Math.min(startPoint.lng, endPoint.lng) - 0.02,
    maxLng: Math.max(startPoint.lng, endPoint.lng) + 0.02,
  };

  const latLngToCanvas = (pos: Position, width: number, height: number) => {
    const x = ((pos.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width;
    const y = height - ((pos.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height;
    return { x, y };
  };

  const canvasToLatLng = (x: number, y: number, width: number, height: number): Position => {
    const lng = bounds.minLng + (x / width) * (bounds.maxLng - bounds.minLng);
    const lat = bounds.maxLat - (y / height) * (bounds.maxLat - bounds.minLat);
    return { lat, lng };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 20; i++) {
      const x = (i / 20) * width;
      const y = (i / 20) * height;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Visited nodes
    ctx.fillStyle = 'rgba(96,165,250,0.3)';
    visitedNodes.forEach(node => {
      const { x, y } = latLngToCanvas(node, width, height);
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Path
    if (pathNodes.length > 1) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      const first = latLngToCanvas(pathNodes[0], width, height);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < pathNodes.length; i++) {
        const { x, y } = latLngToCanvas(pathNodes[i], width, height);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Start
    const startPos = latLngToCanvas(startPoint, width, height);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(startPos.x, startPos.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startPos.x, startPos.y);

    // End
    const endPos = latLngToCanvas(endPoint, width, height);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(endPos.x, endPos.y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('E', endPos.x, endPos.y);
  }, [startPoint, endPoint, visitedNodes, pathNodes, bounds]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    stopRef.current = false;
    setIsRunning(true);
    setVisitedNodes([]);
    setPathNodes([]);
    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });

    const algorithmMap = {
      astar: runAStar,
      dijkstra: runDijkstra,
      bfs: runBFS,
      dfs: runDFS,
      greedy: runGreedy,
    };

    const algorithmFunc = algorithmMap[selectedAlgorithm];

    const result = await algorithmFunc(
      startPoint,
      endPoint,
      obstacles,
      bounds,
      speed,
      (pos) => setVisitedNodes(prev => [...prev, pos]),
      (path) => setPathNodes(path),
      () => stopRef.current
    );

    setStats(result);
    setIsRunning(false);
  }, [selectedAlgorithm, startPoint, endPoint, speed, bounds, obstacles, isRunning]);

  const handleReset = useCallback(() => {
    stopRef.current = true;
    setIsRunning(false);
    setVisitedNodes([]);
    setPathNodes([]);
    setStats({ nodesVisited: 0, pathLength: 0, runtime: 0 });
  }, []);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const startPos = latLngToCanvas(startPoint, canvas.width, canvas.height);
    const endPos = latLngToCanvas(endPoint, canvas.width, canvas.height);

    const distToStart = Math.sqrt((x - startPos.x) ** 2 + (y - startPos.y) ** 2);
    const distToEnd = Math.sqrt((x - endPos.x) ** 2 + (y - endPos.y) ** 2);

    if (distToStart < 15) setDragMode('start');
    else if (distToEnd < 15) setDragMode('end');
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragMode || isRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pos = canvasToLatLng(x, y, canvas.width, canvas.height);

    if (dragMode === 'start') setStartPoint(pos);
    else if (dragMode === 'end') setEndPoint(pos);
  };

  const handleCanvasMouseUp = () => setDragMode(null);

  const algorithm = ALGORITHMS.find(a => a.id === selectedAlgorithm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-8 py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Pathfinding Visualizer
        </h1>
        <p className="text-slate-400 mt-2">Interactive algorithm visualization</p>
      </header>

      <div className="flex gap-6 p-6 h-[calc(100vh-120px)]">
        {/* Controls */}
        <div className="w-96 bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 p-6 overflow-y-auto space-y-6">
          {/* Algorithm Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-400" />
              Algorithm
            </h3>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value as AlgorithmType)}
              disabled={isRunning}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white disabled:opacity-50"
            >
              {ALGORITHMS.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
            {algorithm && (
              <p className="text-slate-400 text-sm mt-2">{algorithm.description}</p>
            )}
          </div>

          {/* Speed */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Speed
            </h3>
            <input
              type="range"
              min="10"
              max="200"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-blue-400"
            />
            <p className="text-sm text-slate-400">Delay: {speed}ms per step</p>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              Statistics
            </h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>Nodes Visited: {stats.nodesVisited}</li>
              <li>Path Length: {stats.pathLength}</li>
              <li>Runtime: {stats.runtime.toFixed(2)} ms</li>
            </ul>
          </div>

          {/* Controls */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> Run
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="rounded-lg cursor-pointer"
          />
          {!isRunning && (
            <div className="absolute bottom-4 right-4 text-slate-500 text-sm flex items-center gap-2">
              <Move className="w-4 h-4" />
              Drag start (S) and end (E) points
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

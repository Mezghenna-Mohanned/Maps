import { motion } from 'framer-motion';
import { Play, RotateCcw, Info, Zap, MapPin } from 'lucide-react';
import { AlgorithmType, MapPosition } from '../types';
import { ALGORITHMS } from '../constants';

interface ControlsProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
  stats: {
    nodesVisited: number;
    pathLength: number;
    runtime: number;
  };
  startPoint: MapPosition;
  endPoint: MapPosition;
}

export const Controls = ({
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  isRunning,
  onRun,
  onReset,
  stats,
  startPoint,
  endPoint,
}: ControlsProps) => {
  const algorithm = ALGORITHMS.find((a) => a.id === selectedAlgorithm);

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Algorithm</h3>
        <select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          disabled={isRunning}
          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white rounded-lg focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {ALGORITHMS.map((algo) => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))}
        </select>

        {algorithm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="text-slate-300">{algorithm.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>Time: {algorithm.timeComplexity}</span>
                  <span>Space: {algorithm.spaceComplexity}</span>
                  <span
                    className={
                      algorithm.guaranteesOptimal
                        ? 'text-emerald-400 font-medium'
                        : 'text-amber-400'
                    }
                  >
                    {algorithm.guaranteesOptimal ? 'Optimal' : 'Non-optimal'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Run
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-medium shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Speed</h3>
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-2">
          <span>Slow</span>
          <span className="font-semibold text-blue-400">{speed}</span>
          <span>Fast</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Locations</h3>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="font-medium text-emerald-400">Start Point</span>
            </div>
            <div className="text-slate-400 text-xs space-y-1">
              <div>Lat: {startPoint.lat.toFixed(4)}</div>
              <div>Lng: {startPoint.lng.toFixed(4)}</div>
            </div>
          </div>
          <div className="p-3 bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span className="font-medium text-rose-400">End Point</span>
            </div>
            <div className="text-slate-400 text-xs space-y-1">
              <div>Lat: {endPoint.lat.toFixed(4)}</div>
              <div>Lng: {endPoint.lng.toFixed(4)}</div>
            </div>
          </div>
          <p className="text-slate-400 text-xs pt-2">
            Drag markers on the map to change locations
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-300 text-sm">Nodes Visited</span>
            <span className="font-semibold text-blue-400 text-lg">
              {stats.nodesVisited.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-300 text-sm">Path Length</span>
            <span className="font-semibold text-emerald-400 text-lg">
              {stats.pathLength.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg">
            <span className="text-slate-300 text-sm">Runtime</span>
            <span className="font-semibold text-yellow-400 text-lg">
              {stats.runtime.toFixed(2)}ms
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-700 rounded-xl p-5 shadow-lg border border-slate-600"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-slate-300">Start Point</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
            <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
            <span className="text-sm text-slate-300">End Point</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
            <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
            <span className="text-sm text-slate-300">Visited Nodes</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-800 rounded">
            <div className="w-3 h-3 border-2 border-emerald-400 rounded-full"></div>
            <span className="text-sm text-slate-300">Final Path</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Shuffle,
  Info,
  Zap,
} from 'lucide-react';
import { AlgorithmType, DrawMode } from '../types';
import { ALGORITHMS } from '../constants';

interface ControlsProps {
  selectedAlgorithm: AlgorithmType;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  drawMode: DrawMode;
  onDrawModeChange: (mode: DrawMode) => void;
  isRunning: boolean;
  isPaused: boolean;
  onRun: () => void;
  onPause: () => void;
  onReset: () => void;
  onClearWalls: () => void;
  onRandomWalls: () => void;
  stats: {
    nodesVisited: number;
    pathLength: number;
    runtime: number;
  };
}

export const Controls = ({
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  drawMode,
  onDrawModeChange,
  isRunning,
  isPaused,
  onRun,
  onPause,
  onReset,
  onClearWalls,
  onRandomWalls,
  stats,
}: ControlsProps) => {
  const algorithm = ALGORITHMS.find((a) => a.id === selectedAlgorithm);

  return (
    <div className="w-full max-w-md space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Algorithm</h3>
        <select
          value={selectedAlgorithm}
          onChange={(e) => onAlgorithmChange(e.target.value as AlgorithmType)}
          disabled={isRunning}
          className="w-full px-4 py-3 bg-white border-2 border-dark-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            className="mt-4 p-4 bg-primary-50 rounded-lg"
          >
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="text-dark-700">{algorithm.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-dark-600">
                  <span>Time: {algorithm.timeComplexity}</span>
                  <span>Space: {algorithm.spaceComplexity}</span>
                  <span
                    className={
                      algorithm.guaranteesOptimal
                        ? 'text-emerald-600 font-medium'
                        : 'text-amber-600'
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
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            Run
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPause}
            disabled={!isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Pause className="w-4 h-4" />
            {isPaused ? 'Resume' : 'Pause'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-200 text-dark-800 rounded-xl font-medium shadow hover:bg-dark-300 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClearWalls}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-dark-200 text-dark-800 rounded-xl font-medium shadow hover:bg-dark-300 transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onRandomWalls}
            disabled={isRunning}
            className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            Generate Maze
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-dark-900">Speed</h3>
          <Zap className="w-4 h-4 text-amber-500" />
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="w-full h-2 bg-dark-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />
        <div className="flex justify-between text-xs text-dark-600 mt-2">
          <span>Slow</span>
          <span className="font-semibold text-primary-600">{speed}</span>
          <span>Fast</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Draw Mode</h3>
        <div className="space-y-2">
          {(['wall', 'start', 'end'] as DrawMode[]).map((mode) => (
            <label
              key={mode}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                drawMode === mode
                  ? 'bg-primary-100 border-2 border-primary-500'
                  : 'bg-white border-2 border-dark-200 hover:border-dark-300'
              }`}
            >
              <input
                type="radio"
                name="draw-mode"
                value={mode}
                checked={drawMode === mode}
                onChange={() => onDrawModeChange(mode)}
                disabled={isRunning}
                className="w-4 h-4 text-primary-600 focus:ring-2 focus:ring-primary-500"
              />
              <span className="font-medium text-dark-800 capitalize">{mode}</span>
            </label>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-dark-600">Nodes Visited</span>
            <span className="font-semibold text-primary-600 text-lg">
              {stats.nodesVisited.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-600">Path Length</span>
            <span className="font-semibold text-emerald-600 text-lg">
              {stats.pathLength.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-dark-600">Runtime</span>
            <span className="font-semibold text-amber-600 text-lg">
              {stats.runtime.toFixed(2)}ms
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-effect-light rounded-2xl p-6 shadow-xl"
      >
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Legend</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-rose-500 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">End</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-dark-800 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">Wall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-400 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">Visited</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-400 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">Frontier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-400 rounded border border-dark-300"></div>
            <span className="text-sm text-dark-700">Path</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

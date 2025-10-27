import { memo } from 'react';
import { motion } from 'framer-motion';
import { CellType, Position } from '../types';

interface GridProps {
  cells: CellType[][];
  onCellInteraction: (row: number, col: number) => void;
  isRunning: boolean;
}

const getCellColor = (type: CellType): string => {
  switch (type) {
    case CellType.START:
      return 'bg-emerald-500';
    case CellType.END:
      return 'bg-rose-500';
    case CellType.WALL:
      return 'bg-dark-800';
    case CellType.VISITED:
      return 'bg-blue-400';
    case CellType.FRONTIER:
      return 'bg-amber-400';
    case CellType.PATH:
      return 'bg-emerald-400';
    default:
      return 'bg-dark-100 hover:bg-dark-200';
  }
};

const Cell = memo(
  ({
    type,
    row,
    col,
    onInteraction,
    isRunning,
  }: {
    type: CellType;
    row: number;
    col: number;
    onInteraction: (row: number, col: number) => void;
    isRunning: boolean;
  }) => {
    const handleMouseDown = () => {
      if (!isRunning) onInteraction(row, col);
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (!isRunning && e.buttons === 1) {
        onInteraction(row, col);
      }
    };

    return (
      <motion.div
        className={`w-4 h-4 border border-dark-200 cursor-pointer transition-colors ${getCellColor(
          type
        )}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        initial={false}
        animate={{
          scale: type === CellType.START || type === CellType.END ? [1, 1.2, 1] : 1,
        }}
        transition={{ duration: 0.2 }}
      />
    );
  }
);

Cell.displayName = 'Cell';

export const Grid = memo(({ cells, onCellInteraction, isRunning }: GridProps) => {
  return (
    <div className="inline-block p-4 bg-white rounded-xl shadow-2xl">
      <div
        className="grid gap-[1px] bg-dark-200"
        style={{
          gridTemplateColumns: `repeat(${cells[0]?.length || 0}, 1rem)`,
        }}
      >
        {cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              type={cell}
              row={rowIndex}
              col={colIndex}
              onInteraction={onCellInteraction}
              isRunning={isRunning}
            />
          ))
        )}
      </div>
    </div>
  );
});

Grid.displayName = 'Grid';

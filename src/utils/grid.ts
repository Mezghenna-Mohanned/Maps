import { CellType, Position, GridState } from '../types';

export const GRID_ROWS = 25;
export const GRID_COLS = 50;

export const createEmptyGrid = (): CellType[][] => {
  return Array(GRID_ROWS)
    .fill(null)
    .map(() => Array(GRID_COLS).fill(CellType.EMPTY));
};

export const initializeGrid = (): GridState => {
  const cells = createEmptyGrid();
  const startPos: Position = { row: 12, col: 10 };
  const endPos: Position = { row: 12, col: 39 };

  cells[startPos.row][startPos.col] = CellType.START;
  cells[endPos.row][endPos.col] = CellType.END;

  return { cells, startPos, endPos };
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
};

export const isWalkable = (cells: CellType[][], row: number, col: number): boolean => {
  if (!isValidPosition(row, col)) return false;
  return cells[row][col] !== CellType.WALL;
};

export const getNeighbors = (
  cells: CellType[][],
  pos: Position,
  includeDiagonal = false
): Position[] => {
  const neighbors: Position[] = [];
  const directions: [number, number][] = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  if (includeDiagonal) {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }

  for (const [dr, dc] of directions) {
    const newRow = pos.row + dr;
    const newCol = pos.col + dc;

    if (isWalkable(cells, newRow, newCol)) {
      neighbors.push({ row: newRow, col: newCol });
    }
  }

  return neighbors;
};

export const clearVisualization = (cells: CellType[][]): CellType[][] => {
  return cells.map((row) =>
    row.map((cell) => {
      if (
        cell === CellType.VISITED ||
        cell === CellType.FRONTIER ||
        cell === CellType.PATH
      ) {
        return CellType.EMPTY;
      }
      return cell;
    })
  );
};

export const generateRandomWalls = (
  cells: CellType[][],
  startPos: Position,
  endPos: Position,
  density = 0.25
): CellType[][] => {
  return cells.map((row, rowIndex) =>
    row.map((cell, colIndex) => {
      if (
        (rowIndex === startPos.row && colIndex === startPos.col) ||
        (rowIndex === endPos.row && colIndex === endPos.col)
      ) {
        return cell;
      }

      if (cell === CellType.WALL || cell === CellType.EMPTY) {
        return Math.random() < density ? CellType.WALL : CellType.EMPTY;
      }

      return cell;
    })
  );
};

export const clearWalls = (cells: CellType[][]): CellType[][] => {
  return cells.map((row) =>
    row.map((cell) => (cell === CellType.WALL ? CellType.EMPTY : cell))
  );
};

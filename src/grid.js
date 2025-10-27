export const GRID_ROWS = 20;
export const GRID_COLS = 30;

export const CellType = {
  EMPTY: 'empty',
  WALL: 'wall',
  START: 'start',
  END: 'end',
  VISITED: 'visited',
  FRONTIER: 'frontier',
  PATH: 'path'
};

export class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.cells = [];
    this.startPos = { row: 10, col: 5 };
    this.endPos = { row: 10, col: 24 };
    this.isMouseDown = false;
    this.drawMode = 'wall';

    this.init();
  }

  init() {
    this.cells = Array(this.rows).fill(null).map(() =>
      Array(this.cols).fill(CellType.EMPTY)
    );
    this.cells[this.startPos.row][this.startPos.col] = CellType.START;
    this.cells[this.endPos.row][this.endPos.col] = CellType.END;
  }

  getCellType(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.cells[row][col];
  }

  setCellType(row, col, type) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return;
    }
    this.cells[row][col] = type;
  }

  isWalkable(row, col) {
    const type = this.getCellType(row, col);
    return type !== null && type !== CellType.WALL;
  }

  getNeighbors(row, col, includeDiagonal = false) {
    const neighbors = [];
    const directions = [
      [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    if (includeDiagonal) {
      directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isWalkable(newRow, newCol)) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }

    return neighbors;
  }

  clearVisualization() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const type = this.cells[row][col];
        if (type === CellType.VISITED || type === CellType.FRONTIER || type === CellType.PATH) {
          this.cells[row][col] = CellType.EMPTY;
        }
      }
    }
  }

  clearWalls() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.cells[row][col] === CellType.WALL) {
          this.cells[row][col] = CellType.EMPTY;
        }
      }
    }
  }

  generateRandomWalls(density = 0.3) {
    this.clearWalls();
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if ((row === this.startPos.row && col === this.startPos.col) ||
            (row === this.endPos.row && col === this.endPos.col)) {
          continue;
        }
        if (Math.random() < density) {
          this.cells[row][col] = CellType.WALL;
        }
      }
    }
  }

  reset() {
    this.init();
  }

  handleCellClick(row, col) {
    if (this.drawMode === 'wall') {
      if (this.cells[row][col] === CellType.EMPTY) {
        this.cells[row][col] = CellType.WALL;
      } else if (this.cells[row][col] === CellType.WALL) {
        this.cells[row][col] = CellType.EMPTY;
      }
    } else if (this.drawMode === 'start') {
      if (this.cells[row][col] !== CellType.END) {
        this.cells[this.startPos.row][this.startPos.col] = CellType.EMPTY;
        this.startPos = { row, col };
        this.cells[row][col] = CellType.START;
      }
    } else if (this.drawMode === 'end') {
      if (this.cells[row][col] !== CellType.START) {
        this.cells[this.endPos.row][this.endPos.col] = CellType.EMPTY;
        this.endPos = { row, col };
        this.cells[row][col] = CellType.END;
      }
    }
  }
}

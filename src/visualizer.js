import { CellType } from './grid.js';

export class Visualizer {
  constructor(grid) {
    this.grid = grid;
    this.gridElement = document.getElementById('grid');
    this.speed = 50;
    this.isPaused = false;
    this.isRunning = false;

    this.initGrid();
  }

  initGrid() {
    this.gridElement.style.gridTemplateColumns = `repeat(${this.grid.cols}, 25px)`;
    this.gridElement.style.gridTemplateRows = `repeat(${this.grid.rows}, 25px)`;

    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = row;
        cell.dataset.col = col;

        cell.addEventListener('mousedown', () => {
          this.grid.isMouseDown = true;
          this.grid.handleCellClick(row, col);
          this.updateCell(row, col);
        });

        cell.addEventListener('mouseenter', () => {
          if (this.grid.isMouseDown && this.grid.drawMode === 'wall') {
            this.grid.handleCellClick(row, col);
            this.updateCell(row, col);
          }
        });

        cell.addEventListener('mouseup', () => {
          this.grid.isMouseDown = false;
        });

        this.gridElement.appendChild(cell);
      }
    }

    document.addEventListener('mouseup', () => {
      this.grid.isMouseDown = false;
    });

    this.render();
  }

  getCellElement(row, col) {
    return this.gridElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
  }

  updateCell(row, col) {
    const cell = this.getCellElement(row, col);
    const type = this.grid.getCellType(row, col);

    cell.className = 'cell';
    if (type !== CellType.EMPTY) {
      cell.classList.add(type);
    }
  }

  render() {
    for (let row = 0; row < this.grid.rows; row++) {
      for (let col = 0; col < this.grid.cols; col++) {
        this.updateCell(row, col);
      }
    }
  }

  async visualizeStep() {
    if (!this.isRunning) return;

    while (this.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.render();

    const delay = 101 - this.speed;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  async visualizePath(path) {
    for (const pos of path) {
      if (!this.isRunning) return;

      while (this.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.grid.setCellType(pos.row, pos.col, CellType.PATH);
      this.updateCell(pos.row, pos.col);

      const delay = (101 - this.speed) / 2;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
  }

  start() {
    this.isRunning = true;
    this.isPaused = false;
  }

  reset() {
    this.stop();
    this.grid.reset();
    this.render();
  }

  clearVisualization() {
    this.grid.clearVisualization();
    this.render();
  }
}

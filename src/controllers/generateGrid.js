function generateShikakuBoard(rows, cols) {
  while (true) {
    let board = Array.from({ length: rows }, () => Array(cols).fill(0));
    let visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    function canPlace(x, y, w, h) {
      if (x + w > cols || y + h > rows) return false;
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          if (visited[i][j]) return false;
        }
      }
      return true;
    }

    function placeRectangle(x, y, w, h) {
      let value = w * h;
      let regionCells = [];

      // Collect all cells belonging to this region
      for (let i = y; i < y + h; i++) {
        for (let j = x; j < x + w; j++) {
          regionCells.push([i, j]);
          visited[i][j] = true;
          board[i][j] = ""; // Initially, empty
        }
      }

      // Pick a random cell from the region to display the number
      let [randY, randX] =
        regionCells[Math.floor(Math.random() * regionCells.length)];
      board[randY][randX] = value; // Assign the number only to this random cell
    }

    function getShuffledSizes() {
      let sizes = [];
      let maxSize = Math.ceil(Math.sqrt(rows * cols) / 2);
      for (let h = 1; h <= Math.min(rows, maxSize); h++) {
        for (let w = 1; w <= Math.min(cols, maxSize); w++) {
          if (w * h > 1) sizes.push([w, h]);
        }
      }
      return sizes.sort(() => Math.random() - 0.5);
    }

    function fillBoard() {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (!visited[y][x]) {
            let sizes = getShuffledSizes();
            for (let [w, h] of sizes) {
              if (canPlace(x, y, w, h)) {
                placeRectangle(x, y, w, h);
                break;
              }
            }
          }
        }
      }
    }

    fillBoard();
    if (!board.some((row) => row.includes(0))) return board;
  }
}

export { generateShikakuBoard };

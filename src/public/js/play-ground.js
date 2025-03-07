const socket = io();

document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("shikakuCanvas");
  const board = JSON.parse(canvas.getAttribute("data-board")); // Retrieve board data safely

  const rows = board.length;
  const cols = board[0].length;
  const cellSize = 40;
  const padding = 1; // Padding to avoid overlap

  const ctx = canvas.getContext("2d");

  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  let isDragging = false;
  let startX, startY, endX, endY;

  // Store selected regions
  let selectedAreas = [];

  // Function to check if two regions overlap
  function isOverlapping(area1, area2) {
    return !(
      area1.x2 < area2.x1 ||
      area1.x1 > area2.x2 ||
      area1.y2 < area2.y1 ||
      area1.y1 > area2.y2
    );
  }

  // Function to remove overlapping areas
  function removeOverlappingAreas(newArea) {
    selectedAreas = selectedAreas.filter(
      (area) => !isOverlapping(area, newArea)
    );
  }

  // Function to draw the grid
  function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellSize;
        const y = row * cellSize;

        ctx.strokeRect(x, y, cellSize, cellSize);

        // Draw numbers in grid
        if (board[row][col] !== "") {
          ctx.fillStyle = "black";
          ctx.font = "bold 16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(board[row][col], x + cellSize / 2, y + cellSize / 2);
        }
      }
    }

    // Draw stored selected regions as blue-bordered rectangles with padding
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;

    selectedAreas.forEach(({ x1, y1, x2, y2 }) => {
      ctx.strokeRect(
        x1 * cellSize + padding,
        y1 * cellSize + padding,
        (x2 - x1 + 1) * cellSize - 2 * padding,
        (y2 - y1 + 1) * cellSize - 2 * padding
      );
    });
  }

  // Convert pixel coordinates to grid position
  function getGridPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / cellSize);
    const y = Math.floor((event.clientY - rect.top) / cellSize);
    return { x, y };
  }

  // Mouse down event (Start selection)
  canvas.addEventListener("mousedown", (event) => {
    const pos = getGridPosition(event);
    startX = pos.x;
    startY = pos.y;
    isDragging = true;
  });

  // Mouse move event (Update selection)
  canvas.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

    const pos = getGridPosition(event);
    endX = Math.max(startX, pos.x);
    endY = Math.max(startY, pos.y);

    drawGrid();

    // Temporary blue border while dragging
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.strokeRect(
      startX * cellSize + padding,
      startY * cellSize + padding,
      (endX - startX + 1) * cellSize - 2 * padding,
      (endY - startY + 1) * cellSize - 2 * padding
    );
  });

  // Mouse up event (Finish selection)
  canvas.addEventListener("mouseup", () => {
    isDragging = false;

    const newSelection = { x1: startX, y1: startY, x2: endX, y2: endY };

    // Remove any overlapping selections
    removeOverlappingAreas(newSelection);

    // Store the selected area
    selectedAreas.push(newSelection);

    drawGrid(); // Redraw to keep the blue border
  });

  // Undo button functionality ============================================================
  document.getElementById("undo").addEventListener("click", () => {
    if (selectedAreas.length > 0) {
      selectedAreas.pop(); // Remove the last selected region
      drawGrid();
    } else {
      alert("Error:🛑 No selections to undo.");
    }
  });

  // Reset button functionality ============================================================
  document.getElementById("reset").addEventListener("click", () => {
    selectedAreas = []; // Clear selections
    drawGrid();
  });

  // Submit button functionality ============================================================
  document.getElementById("submit").addEventListener("click", () => {
    if (selectedAreas.length === 0) {
      alert("Error:🛑 No regions selected!");
      return;
    }

    let gridCovered = Array(rows)
      .fill(null)
      .map(() => Array(cols).fill(false));

    for (let area of selectedAreas) {
      let numberCount = 0;
      let foundNumber = null;
      let areaSize = (area.x2 - area.x1 + 1) * (area.y2 - area.y1 + 1);

      for (let row = area.y1; row <= area.y2; row++) {
        for (let col = area.x1; col <= area.x2; col++) {
          if (gridCovered[row][col]) {
            alert("Error:🛑 Overlapping regions detected.");
            return;
          }
          gridCovered[row][col] = true;

          // Check for numbers in the selected region
          if (board[row][col] !== "") {
            numberCount++;
            foundNumber = parseInt(board[row][col], 10);
          }
        }
      }

      // Rule 1: Each region must contain exactly one number
      if (numberCount !== 1) {
        alert("Error:🛑 Each region must contain exactly one number.");
        return;
      }

      // Rule 2: The number must match the area of the region
      if (foundNumber !== areaSize) {
        alert(
          `Error:🛑 The region must have an area of ${foundNumber}, but it has ${areaSize}.`
        );
        return;
      }
    }

    // Ensure every cell is covered
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (!gridCovered[row][col]) {
          alert("Error:🛑 Some grid cells are not covered.");
          return;
        }
      }
    }

    console.log(selectedAreas);

    fetch("/submit-game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        selectedAreas,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          alert("🎉 Congratulations! Puzzle solved successfully. 🎉");
        } else {
          alert("Error:🛑 Failed to save game data.");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error:🛑 Failed to save game data.");
      });

    alert("🎉 Congratulations! Puzzle solved successfully. 🎉");
  });

  // New Puzzle button functionality ============================================================
  document.getElementById("newPuzzle").addEventListener("click", () => {
    window.location.reload();
  });

  // Initial draw
  drawGrid();
});

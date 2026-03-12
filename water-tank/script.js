// Get all the DOM elements we need
const heightsInput = document.getElementById("heights");
const solveBtn = document.getElementById("solveBtn");
const inputEcho = document.getElementById("inputEcho");
const totalWater = document.getElementById("totalWater");
const columnWater = document.getElementById("columnWater");
const chart = document.getElementById("chart");
const errorMessage = document.getElementById("errorMessage");

// Parse the input string into an array of numbers
function parseInput(inputValue) {
  // Remove brackets and whitespace
  const cleanInput = inputValue.trim().replace(/^\[/, "").replace(/\]$/, "");

  if (!cleanInput) {
    throw new Error("Input cannot be empty.");
  }

  // Split by comma and convert to numbers
  return cleanInput.split(",").map((item) => {
    const num = Number(item.trim());

    if (!Number.isInteger(num) || num < 0) {
      throw new Error("Use only non-negative integers.");
    }

    return num;
  });
}

// Main algorithm - calculate trapped water using left/right max approach
function calculateTrappedWater(heights) {
  const n = heights.length;

  // Arrays to store max height to the left and right of each position
  const maxLeft = new Array(n);
  const maxRight = new Array(n);
  const waterAtEachIndex = new Array(n).fill(0);

  // Fill left max array - for each position, what's the highest wall to the left?
  maxLeft[0] = heights[0];
  for (let i = 1; i < n; i++) {
    maxLeft[i] = Math.max(maxLeft[i - 1], heights[i]);
  }

  // Fill right max array - for each position, what's the highest wall to the right?
  maxRight[n - 1] = heights[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    maxRight[i] = Math.max(maxRight[i + 1], heights[i]);
  }

  // Calculate water at each position
  // Water level = min(left_max, right_max) - current_height
  let totalWaterTrapped = 0;
  for (let i = 0; i < n; i++) {
    const waterLevel = Math.min(maxLeft[i], maxRight[i]) - heights[i];
    waterAtEachIndex[i] = Math.max(0, waterLevel); // Can't have negative water
    totalWaterTrapped += waterAtEachIndex[i];
  }

  return { total: totalWaterTrapped, waterAtIndex: waterAtEachIndex };
}

// Draw the visualization grid
function renderGrid(heights, waterAtIndex) {
  // Find the tallest column (including water) to know how many rows we need
  const maxHeight = Math.max(
    ...heights.map((height, index) => height + waterAtIndex[index]),
  );

  // Clear previous chart and set up grid
  chart.innerHTML = "";
  chart.style.gridTemplateColumns = `repeat(${heights.length}, 44px)`;

  // Draw from top to bottom (that's why we start from maxHeight and go down)
  for (let row = maxHeight; row >= 1; row--) {
    for (let col = 0; col < heights.length; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";

      // Determine what to show in this cell
      if (row <= heights[col]) {
        // This is part of the building/block
        cell.classList.add("block");
      } else if (row <= heights[col] + waterAtIndex[col]) {
        // This is water trapped above the block
        cell.classList.add("water");
      }
      // Otherwise it's empty space (default styling)

      chart.appendChild(cell);
    }
  }
}

// Main function that gets called when user clicks solve or presses enter
function solve() {
  try {
    // Parse the input and run the algorithm
    const heights = parseInput(heightsInput.value);
    const result = calculateTrappedWater(heights);

    // Update the UI with results
    inputEcho.textContent = `[${heights.join(",")}]`;
    totalWater.textContent = `${result.total} units`;
    columnWater.textContent = `[${result.waterAtIndex.join(",")}]`;
    errorMessage.hidden = true;

    // Draw the visualization
    renderGrid(heights, result.waterAtIndex);
  } catch (error) {
    // Show error message and clear the chart
    errorMessage.textContent = error.message;
    errorMessage.hidden = false;
    chart.innerHTML = "";
  }
}

// Set up event listeners
solveBtn.addEventListener("click", solve);

// Allow solving by pressing Enter in the input field
heightsInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    solve();
  }
});

// Run once on page load with the default example
solve();

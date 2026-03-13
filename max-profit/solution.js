// Max profit problem - need to figure out optimal building strategy
// Approach Used: Backtracking / Exhaustive Search
// 1. We recursively try all possible combinations of T, P, and C buildings.
// 2. We keep track of the current day, accumulated profit, and current building count.
// 3. For each building type, if we have enough days left to build it, we calculate its profit
//    for the remaining days, recursively test the next buildings, and then backtrack 
//    (remove the building) to try other combinations.
// 4. We record and return the combination that yields the maximum total profit.
function maxProfit(days) {
  // Building types with their stats
  const buildingTypes = [
    { type: "T", buildTime: 5, dailyEarning: 1500 },
    { type: "P", buildTime: 4, dailyEarning: 1000 },
    { type: "C", buildTime: 10, dailyEarning: 2000 },
  ];

  let maxProfit = 0;
  let bestCombination = { T: 0, P: 0, C: 0 };

  // Try all possible combinations using backtracking
  function tryBuilding(currentDay, totalProfit, buildingCount) {
    // Update best result if we found something better
    if (totalProfit > maxProfit) {
      maxProfit = totalProfit;
      bestCombination = { ...buildingCount };
    }

    // Try building each type of building
    for (let building of buildingTypes) {
      let completionDay = currentDay + building.buildTime;

      // Skip if we don't have enough time to build
      if (completionDay > days) continue;

      // Calculate profit from this building
      let remainingDays = days - completionDay;
      let profitFromBuilding = remainingDays * building.dailyEarning;

      // Add this building and recurse
      buildingCount[building.type]++;
      tryBuilding(
        completionDay,
        totalProfit + profitFromBuilding,
        buildingCount,
      );

      // Backtrack - remove the building
      buildingCount[building.type]--;
    }
  }

  // Start the search
  tryBuilding(0, 0, { T: 0, P: 0, C: 0 });

  return {
    buildings: bestCombination,
    totalEarnings: maxProfit,
  };
}

// Test with the example
console.log("Testing with 13 days:");
let result = maxProfit(13);
console.log(result);

// Let me verify this makes sense
// T building: 5 days to build, then earns 1500/day
// If we build 2 T buildings:
// First T: built on day 5, earns for 8 days = 8 * 1500 = 12000
// Second T: built on day 10, earns for 3 days = 3 * 1500 = 4500
// Total = 16500

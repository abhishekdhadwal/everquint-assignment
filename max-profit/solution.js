// Basically we have 3 types of buildings - Theatre (T), Pub (P), Commercial Park (C)
// Each one takes some days to build and then starts earning daily
// We need to find which buildings to construct to get maximum earnings
//
// Using Dynamic Programming here because backtracking was too slow
// dp[t] = maximum earnings possible when we've spent exactly t days building
// When a building finishes on day t, it earns for the remaining (totalDays - t) days

function maxProfit(days) {
  const buildings = [
    { type: "T", buildTime: 5, dailyEarning: 1500 },
    { type: "P", buildTime: 4, dailyEarning: 1000 },
    { type: "C", buildTime: 10, dailyEarning: 2000 },
  ];

  // dp[t] stores max earnings when t days spent on construction
  const dp = new Array(days + 1).fill(0);

  // track all possible ways to reach each state with max earnings
  const paths = new Array(days + 1).fill(null).map(() => []);

  for (let t = 1; t <= days; t++) {
    for (const b of buildings) {
      if (t < b.buildTime) continue;

      const prevT = t - b.buildTime;
      const earnings = dp[prevT] + (days - t) * b.dailyEarning;

      if (earnings > dp[t]) {
        // found better solution, reset paths
        dp[t] = earnings;
        paths[t] = [{ prevT, building: b }];
      } else if (earnings === dp[t] && dp[t] > 0) {
        // found another way to get same max earnings
        paths[t].push({ prevT, building: b });
      }
    }
  }

  // find maximum earnings across all possible construction times
  let maxEarnings = 0;
  for (let t = 0; t <= days; t++) {
    maxEarnings = Math.max(maxEarnings, dp[t]);
  }

  // collect all time points that achieve max earnings
  const optimalTimes = [];
  for (let t = 0; t <= days; t++) {
    if (dp[t] === maxEarnings) {
      optimalTimes.push(t);
    }
  }

  // reconstruct all unique building combinations
  const allSolutions = new Set();

  function backtrack(t, counts) {
    if (paths[t].length === 0) {
      // reached base case, save this combination
      const key = `T: ${counts.T} P: ${counts.P} C: ${counts.C}`;
      allSolutions.add(key);
      return;
    }

    for (const { prevT, building } of paths[t]) {
      counts[building.type]++;
      backtrack(prevT, counts);
      counts[building.type]--;
    }
  }

  // explore all paths from all optimal time points
  for (const t of optimalTimes) {
    backtrack(t, { T: 0, P: 0, C: 0 });
  }

  return {
    earnings: maxEarnings,
    solutions: Array.from(allSolutions).sort(),
  };
}

// Simple test cases
console.log("Test n=7:", maxProfit(7));
console.log("\nTest n=8:", maxProfit(8));
console.log("\nTest n=13:", maxProfit(13));
console.log("\nTest n=49:", maxProfit(49));

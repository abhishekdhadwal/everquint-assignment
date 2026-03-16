// So basically what we are doing here is, we have 3 types of buildings only.
// Each building is taking some days to construct and after that it is giving money on daily basis.
// We have to find out which buildings to build and in what order so that total earning is maximum.
//
// First I was trying backtracking only but that was becoming very slow for large inputs
// and also not giving correct answer always. So I have used Dynamic Programming approach here.
//
// Main logic is this — instead of tracking current day, we are tracking total days spent in construction.
// dp[t] means what is the best profit we can get if t days are spent on construction total.
// Whatever building finishes on day t, it will earn money for remaining (totalDays - t) days only.

function maxProfit(days) {
  const buildingTypes = [
    { type: "T", buildTime: 5, dailyEarning: 1500 },
    { type: "P", buildTime: 4, dailyEarning: 1000 },
    { type: "C", buildTime: 10, dailyEarning: 2000 },
  ];

  // dp[t] = max profit achievable by spending exactly t days on construction
  const dp = new Array(days + 1).fill(0);

  // keeping track of choices so we can reconstruct which buildings were picked
  const from = new Array(days + 1).fill(null);

  for (let t = 1; t <= days; t++) {
    for (const b of buildingTypes) {
      if (t < b.buildTime) continue;

      const prevT = t - b.buildTime;
      // this building finishes on day t, so it earns for the remaining days
      const earnings = dp[prevT] + (days - t) * b.dailyEarning;

      if (earnings > dp[t]) {
        dp[t] = earnings;
        from[t] = { prevT, building: b };
      }
    }
  }

  // the answer isn't necessarily at dp[days] — we might not want to fill every day
  // e.g. starting a building on the last day earns nothing, so we skip it
  let bestT = 0;
  for (let t = 1; t <= days; t++) {
    if (dp[t] > dp[bestT]) bestT = t;
  }

  // walk back through our choices to count how many of each building we built
  const buildingCount = { T: 0, P: 0, C: 0 };
  let cur = bestT;
  while (from[cur] !== null) {
    const { prevT, building } = from[cur];
    buildingCount[building.type]++;
    cur = prevT;
  }

  return {
    buildings: buildingCount,
    totalEarnings: dp[bestT],
  };
}

// quick sanity checks
console.log("13 days:", maxProfit(13));
// T built on day 5 earns 8*1500 = 12000, second T on day 10 earns 3*1500 = 4500 → 16500

console.log("0 days:", maxProfit(0));

console.log("4 days:", maxProfit(4));
// not enough time to earn anything useful

console.log("5 days:", maxProfit(5));
// P finishes day 4, earns 1*1000 = 1000

console.log("10 days:", maxProfit(10));
// T on day 5 earns 5*1500=7500, P on day 9 earns 1*1000=1000 → 8500

console.log("20 days:", maxProfit(20));

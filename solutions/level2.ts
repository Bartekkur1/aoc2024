import { readLevel } from "aoc-util";

type Report = number[];

const loadInput = async () => {
  return readLevel({
    level: 2,
    year: 2024,
    parser: (line) => {
      const reports: Report[] = [];

      for (const l of line) {
        if (l === '') continue;
        reports.push(l.split(/\s/).map(Number));
      }
      return reports;
    },
  });
};

const isSafe = (report: Report): boolean => {
  let increasing = true;
  let decreasing = true;
  for (let i = 0; i < report.length - 1; i++) {
    if (report[i + 1] === undefined) continue;
    const diff = report[i] - report[i + 1];

    if (diff > 3 || diff < -3 || diff === 0) {
      return false;
    }

    if (diff < 0) {
      decreasing = false;
    }

    if (diff > 0) {
      increasing = false;
    }

  }

  return increasing || decreasing;
};

const solve_part1 = async (reports: Report[]) => {
  let safeReports = 0;
  for (const r of reports) {
    const safe = isSafe(r);
    if (safe) {
      safeReports++;
    }
  }
  return safeReports;
};

const solve_part2 = async (reports: Report[]) => {
  let safeReports = 0;
  for (const r of reports) {
    const safe = isSafe(r);
    if (safe) {
      safeReports++;
      continue;
    }

    for (let i = 0; i < r.length; i++) {
      const copy = r.slice();
      copy.splice(i, 1);
      const safe = isSafe(copy);
      if (safe) {
        safeReports++;
        break;
      }
    }
  }
  return safeReports;
};

(async () => {
  const reports = await loadInput();
  const part1Solution = await solve_part1(reports);
  console.log("Part 1:", part1Solution);
  console.log("\n");
  const part2Solution = await solve_part2(reports);
  console.log("Part 2:", part2Solution);
})();
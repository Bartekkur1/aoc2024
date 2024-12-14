import { readLevel } from "aoc-util";

type Vec = {
  x: number;
  y: number;
};

type Button = {
  diff: Vec;
};

type Behavior = {
  buttonA: Button,
  buttonB: Button,
  Prize: Vec,
};

type ButtonsPushes = {
  buttonAPushes: number;
  buttonBPushes: number;
}

const extractVec = (rawValue: string): Vec => {
  const nums = rawValue.match(/\d+/g);
  if (nums === null || nums.length !== 2) {
    throw new Error(`Invalid button: ${rawValue}`);
  }
  return {
    x: parseInt(nums[0]),
    y: parseInt(nums[1]),
  }
};

const solveInput = (aButton: Button, bButton: Button, prize: Vec): ButtonsPushes => {
  const { x: a, y: b } = aButton.diff;
  const { x: c, y: d } = bButton.diff;
  const { x: dX, y: dY } = prize;

  const aMoves = (dX * d - dY * c) / (a * d - b * c);
  const bMoves = (dY * a - dX * b) / (a * d - b * c);

  return {
    buttonAPushes: Math.ceil(aMoves),
    buttonBPushes: Math.ceil(bMoves),
  }
};

const verifyPushes = (buttonPushes: ButtonsPushes, behavior: Behavior) => {
  const { Prize, buttonA, buttonB } = behavior;
  const { buttonAPushes, buttonBPushes } = buttonPushes;
  const sum: Vec = { x: 0, y: 0 };

  sum.x = buttonAPushes * buttonA.diff.x + buttonBPushes * buttonB.diff.x;
  sum.y = buttonAPushes * buttonA.diff.y + buttonBPushes * buttonB.diff.y;

  return sum.x === Prize.x && sum.y === Prize.y;
};

const calculatePushPrice = (buttonPushes: ButtonsPushes): number => {
  return buttonPushes.buttonAPushes * 3 + buttonPushes.buttonBPushes;
};

const makeLifeHarder = (behaviors: Behavior[]) => {
  return behaviors.map(behavior => ({
    ...behavior,
    Prize: {
      x: behavior.Prize.x + 10_000_000_000_000,
      y: behavior.Prize.y + 10_000_000_000_000,
    }
  }))
};

const behaviors = await readLevel<Behavior[]>({
  level: 13,
  year: 2024,
  splitter: /\n\n/,
  parser: (packs) => {
    return packs.map(pack => {
      const lines = pack.split('\n');
      return {
        buttonA: { diff: extractVec(lines[0]) },
        buttonB: { diff: extractVec(lines[1]) },
        Prize: extractVec(lines[2]),
      }
    });
  }
});

const solvePart1 = () => {
  return behaviors.reduce((sum, behavior) => {
    const solution = solveInput(behavior.buttonA, behavior.buttonB, behavior.Prize);
    const verified = verifyPushes(solution, behavior);
    if (verified) {
      sum += calculatePushPrice(solution);
    }
    return sum;
  }, 0);
};

const solvePart2 = () => {
  let sum = 0;
  const harderBehaviors = makeLifeHarder(behaviors);
  for (const behavior of harderBehaviors) {
    const solution = solveInput(behavior.buttonA, behavior.buttonB, behavior.Prize);
    const verified = verifyPushes(solution, behavior);
    if (verified) {
      sum += calculatePushPrice(solution);
    }
  }

  return sum;
};

const part1Solution = solvePart1();
console.log(`Part 1 solution: ${part1Solution}`);

const part2Solution = solvePart2();
console.log(`Part 2 solution: ${part2Solution}`);
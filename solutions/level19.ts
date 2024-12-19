import { readLevel } from "aoc-util";

type Input = {
  stripes: string[];
  towels: string[];
}

const input = await readLevel<Input>({
  level: 19,
  year: 2024,
  splitter: /\n\n/,
  parser: (lines) => {
    const [stripesRaw, towelsRaw] = lines;
    return {
      stripes: stripesRaw.split(',').map(e => e.trim()),
      towels: towelsRaw.split('\n')
    };
  }
});

const matchAll = (towel: string, stripes: string[]) => {
  const dp: number[] = Array(towel.length + 1).fill(0);
  dp[0] = 1;

  for (let i = 0; i < towel.length; i++) {
    if (dp[i] === 0) continue;

    for (const stripe of stripes) {
      if (towel.startsWith(stripe, i)) {
        dp[i + stripe.length] += dp[i];
      }
    }
  }

  return dp[towel.length];
};

const solvePart1 = (input: Input) => {
  let count = 0;
  input.stripes.sort((a, b) => b.length - a.length);

  for (const towel of input.towels) {
    const res = matchAll(towel, input.stripes);
    if (res > 0) {
      count++;
    }
  }

  console.log(count);
};

const solvePart2 = (input: Input) => {
  let count = 0;
  input.stripes.sort((a, b) => b.length - a.length);

  for (const towel of input.towels) {
    const occurringStripes = input.stripes.filter(s => towel.includes(s));
    const res = matchAll(towel, occurringStripes);
    count += res;
  }

  console.log(count);
};

solvePart1(input);
solvePart2(input);
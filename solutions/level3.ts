import { readLevel } from 'aoc-util';

type instruction = {
  type: "mul" | "do" | "don't";
  value: string;
}

const readInput = async (): Promise<instruction[]> => {
  return readLevel<instruction[]>({
    level: 3,
    year: 2024,
    parser: (line) => {
      return line[0].match(/don\'t\(\)|do\(\)|mul\(\d{1,3},\d{1,3}\)/g)?.map((value) => {
        if (value === 'don\'t()') {
          return { type: "don't", value };
        } else if (value === 'do()') {
          return { type: "do", value };
        } else {
          return { type: "mul", value };
        }
      }) ?? [];
    },
  });
};

const executeMul = (mul: string): number => {
  const [a, b] = mul.match(/\d{1,3}/g)?.map(Number) ?? [];
  return a * b;
}

const solve_part1 = (instructions: instruction[]) => {
  let sum = 0;
  for (const instruction of instructions) {
    if (instruction.type === "mul") {
      sum += executeMul(instruction.value);
    }
  }
  return sum;
};

const solve_part2 = async (instructions: instruction[]) => {
  let sum = 0;
  let ruleFound = false;
  let enabled = false;
  for (let i = 0; i < instructions.length; i++) {
    const current = instructions[i];

    if (!ruleFound) {
      ruleFound = current.type === "don't" || current.type === "do";
      if (!ruleFound && current.type === "mul") {
        sum += executeMul(current.value);
        continue;
      }
    }

    if (current.type === "don't" || current.type === "do") {
      enabled = current.type === "do";
      continue;
    } else if (current.type === "mul" && enabled) {
      sum += executeMul(current.value);
    }
  }
  return sum;
};

(async () => {
  const input = await readInput();
  const part1Solution = solve_part1(input);
  console.log(`Part 1: ${part1Solution}`);
  const part2Solution = await solve_part2(input);
  console.log(`Part 2: ${part2Solution}`);
})();
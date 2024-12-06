import { readLevel } from 'aoc-util';

type Update = number[];
type Rules = { [key: string]: number[] };

interface Input {
  rules: Rules;
  updates: Update[];
};

interface ValidationResult {
  isValid: boolean;
  invalidNumbers: number[];
  update: Update;
}

const readInput = async (): Promise<Input> => {
  return readLevel({
    level: 5,
    year: 2024,
    parser: (lines) => {
      const input: Input = {
        rules: {},
        updates: [],
      };

      for (const line of lines) {
        // Ignore empty lines
        if (line === '') continue;
        // Read rules
        if (/\|/.test(line)) {
          const [value, before] = line.split('|').map(Number);
          if (!input.rules[value]) {
            input.rules[value] = [];
          }
          input.rules[value].push(before);
        }
        else {
          input.updates.push(line.split(',').map(Number));
        }
      }

      return input;
    }
  })
};

const getMiddleValue = (update: Update): number => {
  return update[Math.floor(update.length / 2)];
};

const isUpdateValid = (update: Update, rules: Rules): ValidationResult => {
  const checkedNumbers: number[] = [];
  const invalidNumbers: number[] = [];
  for (const num of update) {
    const numRules = rules[num] ?? [];
    for (const numRule of numRules) {
      if (checkedNumbers.includes(numRule)) {
        invalidNumbers.push(num);
      }
    }
    checkedNumbers.push(num);
  }

  return {
    isValid: invalidNumbers.length === 0,
    invalidNumbers,
    update
  };
};

const insertAtAllPositions = (arr: number[], num: number): number[][] => {
  return arr.map((_, i) => [...arr.slice(0, i), num, ...arr.slice(i)]).concat([[...arr, num]]);
};

const solvePart1 = (input: Input) => {
  let sum = 0;
  for (const update of input.updates) {
    const { isValid } = isUpdateValid(update, input.rules);
    if (isValid) {
      sum += getMiddleValue(update);
    }
  }
  return sum;
};

const solvePart2 = (input: Input) => {
  return input.updates
    .map(update => isUpdateValid(update, input.rules))
    .filter(({ isValid }) => !isValid)
    .map(invalidUpdate => {
      const { update } = invalidUpdate;
      let validUpdate: number[] = [];

      for (const num of update) {
        const possibleCombinations = insertAtAllPositions(validUpdate, num);
        for (const possibleCombination of possibleCombinations) {
          if (isUpdateValid(possibleCombination, input.rules).isValid) {
            validUpdate = possibleCombination;
            break;
          }
        }
      }

      return getMiddleValue(validUpdate);
    })
    .reduce((acc, curr) => acc + curr, 0);
};

const input = await readInput();
const part1Solution = solvePart1(input);
console.log('Part 1:', part1Solution);
const part2Solution = solvePart2(input);
console.log('Part 2:', part2Solution);
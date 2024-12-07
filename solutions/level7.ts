import { readLevel } from 'aoc-util';

interface Calibration {
  result: number;
  equation: number[];
}

const input = await readLevel({
  level: 7,
  year: 2024,
  parser: (lines) => {
    const calibrations: Calibration[] = [];
    for (const line of lines) {
      if (line === "") continue;
      const [result, equationRaw] = line.split(":");
      const equation = equationRaw.slice(1).split(" ").map(Number);
      calibrations.push({
        result: Number(result),
        equation
      });
    }

    return calibrations;
  },
});

const generateOperatorsCombinations = (operators: string[], length: number): string[][] => {
  const result: string[][] = [];

  function backtrack(current: string): void {
    const elements = current.split("");
    if (elements.length === length) {
      result.push(current.split(""));
      return;
    }

    operators.forEach(op => {
      backtrack(current + op);
    })
  }

  backtrack("");
  return result;
}

const applyOperators = (equation: number[], operators: string[]): number => {
  let result = equation[0];

  for (let i = 1; i < equation.length; i++) {
    if (operators[i - 1] === "+") {
      result += equation[i];
    } else if (operators[i - 1] === "*") {
      result *= equation[i];
    } else if (operators[i - 1] === "|") {
      result = Number(result.toString() + equation[i].toString());
    }
  }

  return result;
};

const solveCalibrations = (calibrations: Calibration[], operators: string[]): number => {
  return calibrations.reduce((acc, calibration) => {
    const operatorsCombination = generateOperatorsCombinations(operators, calibration.equation.length);
    for (const operator of operatorsCombination) {
      const operatorResult = applyOperators(calibration.equation, operator);
      if (operatorResult === calibration.result) {
        acc += operatorResult;
        break;
      }
    }

    return acc;
  }, 0);
};

const part1Solution = solveCalibrations(input, ["*", "+"]);
console.log(`Part 1: ${part1Solution}`);
const part2Solution = solveCalibrations(input, ["*", "+", "|"]);
console.log(`Part 2: ${part2Solution}`);
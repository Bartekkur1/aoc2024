import { readLevel } from 'aoc-util';

type LocationList = {
  left: number[],
  right: number[],
};

const loadInput = async (): Promise<LocationList> => {
  return readLevel({
    level: 1,
    year: 2024,
    parser: (line) => {
      const numbers: { left: number[], right: number[] } = { left: [], right: [] };
      for (const l of line) {
        if (l === '') continue;
        const [leftNum, rightNum] = l.split(/\s{3}/);
        numbers.left.push(parseInt(leftNum));
        numbers.right.push(parseInt(rightNum));
      }

      numbers.left.sort((a, b) => a - b);
      numbers.right.sort((a, b) => a - b);
      return numbers;
    },
  });
}

const solve_part2 = async () => {
  return loadInput().then((input) =>
    input.left
      .map((left) => left * input.right.filter((r) => r === left).length)
      .reduce((acc, curr) => acc + curr, 0));
};

const solve_part1 = async (): Promise<number> => {
  return loadInput().then((input) =>
    input.left
      .map((left, i) => Math.abs(left - input.right[i]))
      .reduce((acc, curr) => acc + curr, 0));
};

(async () => {
  const part1_result = await solve_part1();
  console.log(`Part 1: ${part1_result}`);
  const part2_result = await solve_part2();
  console.log(`Part 2: ${part2_result}`);
})();
import { readLevel } from "aoc-util";

type Stone = number;
type StoneMap = { [key: number]: number };

const getInput = async () => {
  return await readLevel<Stone[]>({
    level: 11,
    year: 2024,
    parser: (lines) => {
      return lines[0].split(/\s/).map(Number);
    }
  });
};

const solve = (stones: Stone[], blinks: number) => {
  let stonesMap: StoneMap = stones.reduce<StoneMap>((acc, stone) => {
    acc[stone] === undefined ? acc[stone] = 1 : acc[stone]++;
    return acc;
  }, {});

  for (let blink = 0; blink < blinks; blink++) {
    let newMap: StoneMap = {};

    for (const [stone, count] of Object.entries(stonesMap)) {
      const stoneNum = Number(stone);

      if (stoneNum === 0) {
        newMap[1] === undefined ? newMap[1] = count : newMap[1] += count;
      } else if (stone.length % 2 === 0) {
        const left = Number(stone.slice(0, stone.length / 2));
        const right = Number(stone.slice(stone.length / 2));
        newMap[left] === undefined ? newMap[left] = count : newMap[left] += count;
        newMap[right] === undefined ? newMap[right] = count : newMap[right] += count;
      } else {
        const muled = stoneNum * 2024;
        newMap[muled] === undefined ? newMap[muled] = count : newMap[muled] += count;
      }
    }

    stonesMap = newMap;
  }

  let sum = 0;
  for (const [_, count] of Object.entries(stonesMap)) {
    sum += count;
  }
  return sum;
};

const input = await getInput();
const part1Solution = solve(input, 25);
console.log(`Part 1: ${part1Solution}`);

const part2Solution = solve(input, 75);
console.log(`Part 2: ${part2Solution}`);
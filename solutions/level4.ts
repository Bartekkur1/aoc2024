import { readLevel } from 'aoc-util';

type UnfoldDirection = "horizontal" | "vertical" | "diagonal" | "reverse-diagonal";

const readInput = async (): Promise<string[]> => {
  return readLevel<any>({
    level: 4,
    year: 2024,
    parser: (line) => {
      return line
    },
  });
};

const countWord = (input: string, word: string) => {
  return input.split(word).length - 1;
};

const unfold = (input: string[], direction: UnfoldDirection): string[] => {
  const unfolded: string[] = [];
  if (direction === "horizontal") {
    return input;
  } else if (direction === "vertical") {
    for (let x = 0; x < input[0]?.length; x++) {
      const group: string[] = [];
      for (let y = 0; y < input.length; y++) {
        group.push(input[y][x]);
      };
      unfolded.push(group.join(""));
    };
  } else if (direction === "diagonal") { // this is a mess
    const rows = input.length;
    const cols = input[0]?.length || 0;

    for (let d = 0; d < rows + cols - 1; d++) {
      const group: string[] = [];
      for (let r = Math.max(0, d - cols + 1), c = Math.min(d, cols - 1); r < rows && c >= 0; r++, c--) {
        group.push(input[r][c]);
      }
      unfolded.push(group.join(""));
    }
  } else if (direction === "reverse-diagonal") {
    const rows = input.length;
    const cols = input[0]?.length || 0;

    for (let d = 0; d < rows + cols - 1; d++) {
      const group: string[] = [];
      for (let r = Math.max(0, d - cols + 1), c = Math.min(d, cols - 1); r < rows && c >= 0; r++, c--) {
        group.push(input[r][cols - 1 - c]);
      }
      unfolded.push(group.join(""));
    }
  }
  return unfolded;
};

const solvePart1 = (input: string[]): number => {
  const unfoldedInput = [
    ...unfold(input, "horizontal"),
    ...unfold(input, "vertical"),
    ...unfold(input, "diagonal"),
    ...unfold(input, "reverse-diagonal"),
  ];
  let sum = 0;
  for (const row of unfoldedInput) {
    sum += countWord(row, "XMAS") + countWord(row, "SAMX");
  }
  return sum;
};

const solvePart2 = (input: string[]): number => {
  let sum = 0;
  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[0].length; x++) {
      const current = input[y][x];

      if (current === 'A') {
        const topLeftNeighbor = input[y - 1]?.[x - 1];
        const topRightNeighbor = input[y - 1]?.[x + 1];
        const bottomRightNeighbor = input[y + 1]?.[x + 1];
        const bottomLeftNeighbor = input[y + 1]?.[x - 1];
        const diagonalNeighbors = [
          topLeftNeighbor,
          topRightNeighbor,
          bottomRightNeighbor,
          bottomLeftNeighbor,
        ];
        if (
          diagonalNeighbors.filter(n => n === 'M')?.length === 2 &&
          diagonalNeighbors.filter(n => n === "S")?.length === 2 &&
          topLeftNeighbor !== bottomRightNeighbor &&
          topRightNeighbor !== bottomLeftNeighbor) {
          sum += 1;
        }
      }
    }
  }

  return sum;
};

(async () => {
  const input = await readInput();

  const part1Solution = solvePart1(input);
  console.log(`Part 1: ${part1Solution}`);

  const part2Solution = solvePart2(input);
  console.log(`Part 2: ${part2Solution}`);
})();
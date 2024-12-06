import { readLevel } from 'aoc-util';

const MAX_BRUTE_FORCE_ITERATIONS = 7000;

enum Direction {
  Up = "^",
  Down = "v",
  Left = "<",
  Right = ">",
};

const DirectionValues = Object.values(Direction);

type Position = {
  x: number;
  y: number;
};

type Guard = Position & { direction: Direction };

const PositionEqual = (a: Position, b: Position) => {
  return a.x === b.x && a.y === b.y;
};

const readInput = async (): Promise<string[][]> => {
  return readLevel({
    level: 6,
    year: 2024,
    parser: (lines) => {
      return lines.map(line => line.split(''));
    },
  });
};

const drawMap = (map: string[][]) => {
  for (let row = 0; row < map.length; row++) {
    console.log(map[row].join(''));
  }
};

const move = (map: string[][], guard: Guard, direction: Direction): Position => {
  const { x, y } = guard;
  const nextPosition = {
    x: x + (direction === Direction.Right ? 1 : direction === Direction.Left ? -1 : 0),
    y: y + (direction === Direction.Up ? -1 : direction === Direction.Down ? 1 : 0),
  }

  const nextPositionChar = map[nextPosition.y]?.[nextPosition.x];
  if (nextPositionChar === '.' || nextPositionChar === 'X') {
    map[y][x] = 'X';
    map[nextPosition.y][nextPosition.x] = direction;
    guard.x = nextPosition.x;
    guard.y = nextPosition.y;
  } else if (nextPositionChar === '#') {
    // Turn right
    const newDirection = direction === Direction.Up ? Direction.Right :
      direction === Direction.Right ? Direction.Down :
        direction === Direction.Down ? Direction.Left :
          Direction.Up;
    map[y][x] = newDirection;
    guard.direction = newDirection;
  }
  return nextPosition;
};

const findGuard = (map: string[][]): Guard => {
  for (let row = 0; row < map.length; row++) {
    for (let char = 0; char < map[row].length; char++) {
      const val = map[row][char];
      if (DirectionValues.includes(val as Direction)) {
        return {
          x: char,
          y: row,
          direction: val as Direction,
        };
      }
    }
  }

  throw new Error("Guard not found!");
};

const solvePart1 = async (input?: string[][]): Promise<[number, number]> => {
  const map = input ?? await readInput();
  let lastPosition: Position = { x: 0, y: 0 };
  let lastDirection: Direction = Direction.Up;
  let iteration = 0;

  const guard = findGuard(map);

  while (true) {
    lastDirection = guard.direction;
    lastPosition = { x: guard.x, y: guard.y };

    if (iteration > MAX_BRUTE_FORCE_ITERATIONS) {
      break;
    }

    move(map, guard, guard.direction);

    if (PositionEqual(guard, lastPosition) && guard.direction === lastDirection) {
      break;
    }

    iteration++;
  }

  const visited = map.reduce((acc, row) => {
    return acc + row.filter(char => char === 'X').length;
  }, 0);

  return [visited + 1, iteration];
};

const generateMapVariant = (cleanMap: string[][], newObstacle: Position) => {
  const mapCopy = cleanMap.map(row => [...row]);
  mapCopy[newObstacle.y][newObstacle.x] = '#';

  return mapCopy;
};

// Guards final position is always the last element
const getAllVisitedPositions = (solvedMap: string[][]): Position[] => {
  const allVisitedPosition = solvedMap.reduce<Position[]>((acc, row, rowIndex) => {
    for (let col = 0; col < row.length; col++) {
      if (row[col] === 'X') {
        acc.push({ x: col, y: rowIndex });
      }
    }
    return acc;
  }, []);

  const guard = findGuard(solvedMap);
  const guardFinalPosition = { x: guard.x, y: guard.y };
  allVisitedPosition.push(guardFinalPosition);

  return allVisitedPosition;
};

// < 2097
const solvePart2 = async () => {
  let loopVariants = 0;
  let iteration = 0;
  const clearMap = await readInput();

  const solvedMap = clearMap.map(row => [...row]);
  await solvePart1(solvedMap);
  const allVisitedPosition = getAllVisitedPositions(solvedMap);

  const initialGuardPosition = findGuard(clearMap);
  for (const visitedPosition of allVisitedPosition) {
    iteration++;
    if (visitedPosition.x === initialGuardPosition.x && visitedPosition.y === initialGuardPosition.y) {
      continue;
    }

    const mapVariant = generateMapVariant(clearMap, visitedPosition);
    const variantResult = await solvePart1(mapVariant);
    if (variantResult[1] > MAX_BRUTE_FORCE_ITERATIONS) {
      loopVariants++;
      // drawMap(mapVariant);
      // console.log(`Map variant for ${visitedPosition.x}, ${visitedPosition.y}`);
      // console.log(`Result: ${variantResult[0]} in ${variantResult[1]} iterations`);
      // console.log("\n");
    }
    console.log(`Iteration ${iteration} of ${allVisitedPosition.length}`);
  }

  return loopVariants;
};

// const [part1Solution, iteration] = await solvePart1();
// console.log(`Part 1: ${part1Solution} in ${iteration} iterations`);
const part2Solution = await solvePart2();
console.log(`Part 2: ${part2Solution}`);
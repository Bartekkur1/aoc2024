import { readLevel } from "aoc-util";

type Vector = {
  x: number;
  y: number;
}

type Position = Vector;

type Antenna = {
  position: Position;
  frequency: string;
}

type Input = {
  antennas: Antenna[];
  mapSize: Vector;
}

type PositionCache = { [key: string]: boolean };

type CacheUtil = {
  takePosition: (position: Position) => void;
  isPositionFree: (position: Position) => boolean;
}

const { antennas, mapSize } = await readLevel<Input>({
  level: 8,
  year: 2024,
  parser: (lines) => {
    const antennas: Antenna[] = [];
    for (let y = 0; y < lines.length; y++) {
      const line = lines[y];
      for (let x = 0; x < line.length; x++) {
        if (/\d|[a-z]|[A-Z]/.test(line[x])) {
          antennas.push({
            position: { x, y },
            frequency: line[x],
          });
        }
      }
    }

    return {
      antennas,
      mapSize: { x: lines[0].length, y: lines.length },
    };
  },
});

const registerPositionCache = (antennas: Antenna[]): CacheUtil => {
  const cache: PositionCache = {};

  const takePosition = (position: Position) => {
    cache[`${position.x},${position.y}`] = true;
  };

  const isPositionFree = (position: Position): boolean => {
    return cache[`${position.x},${position.y}`] === undefined &&
      cache[`${position.x},${position.y}`] !== true;
  };


  for (const antenna of antennas) {
    takePosition(antenna.position);
  }

  return {
    takePosition,
    isPositionFree,
  };
};

const groupByFrequency = (antennas: Antenna[]): Record<string, Antenna[]> => {
  const result: Record<string, Antenna[]> = {};

  for (const antenna of antennas) {
    result[antenna.frequency] === undefined ?
      result[antenna.frequency] = [antenna] :
      result[antenna.frequency].push(antenna);
  }

  return result;
};

const drawMap = (antennas: Antenna[], antiNodes: Position[], mapSize: Vector) => {
  const map: string[][] = Array(mapSize.y).fill(null).map(() => Array(mapSize.x).fill('.'));

  for (const antenna of antennas) {
    map[antenna.position.y][antenna.position.x] = antenna.frequency;
  }

  for (const antiNode of antiNodes) {
    map[antiNode.y][antiNode.x] = '#';
  }

  for (let row = 0; row < map.length; row++) {
    console.log(map[row].join(''));
  }
};

const isInBounds = (vec: Vector, size: Vector): boolean => {
  return vec.x >= 0 && vec.x < size.x && vec.y >= 0 && vec.y < size.y;
};

const findPositionDiff = (a: Antenna, b: Antenna): Vector => {
  return {
    x: a.position.x - b.position.x,
    y: a.position.y - b.position.y,
  };
};

const applyDiff = (vec: Vector, diff: Vector): Vector => {
  return {
    x: vec.x + diff.x,
    y: vec.y + diff.y,
  };
};

const solvePart1 = () => {
  const antennasPosition = registerPositionCache(antennas);
  const groups = groupByFrequency(antennas);
  const antiNodes: Position[] = [];

  for (const group in groups) {
    const groupAntennas = groups[group];
    for (const antenna of groupAntennas) {
      const otherAntennas = groupAntennas.filter(a => a !== antenna);
      for (const otherAntenna of otherAntennas) {
        const positionDiff = findPositionDiff(antenna, otherAntenna);
        const antiNodePosition = applyDiff(antenna.position, positionDiff);
        if (antennasPosition.isPositionFree(antiNodePosition) && isInBounds(antiNodePosition, mapSize)) {
          antiNodes.push(applyDiff(antenna.position, positionDiff));
        }
      }
    };
  }

  return antiNodes.length;
};

const applyAntiNode = (result: Position[], cache: CacheUtil, lastNodePosition: Position, diff: Vector) => {
  const antiNodePosition = applyDiff(lastNodePosition, diff);
  if (isInBounds(antiNodePosition, mapSize)) {
    if (cache.isPositionFree(antiNodePosition)) {
      result.push(antiNodePosition);
    }
    cache.takePosition(antiNodePosition);
    applyAntiNode(result, cache, antiNodePosition, diff);
  }

  return;
};

const solvePart2 = () => {
  const groups = groupByFrequency(antennas);
  const antiNodesPosition = registerPositionCache([]);
  const antiNodes: Position[] = [];

  for (const group in groups) {
    const groupAntennas = groups[group];
    for (const antenna of groupAntennas) {
      const otherAntennas = groupAntennas.filter(a => a !== antenna);
      for (const otherAntenna of otherAntennas) {
        const positionDiff = findPositionDiff(antenna, otherAntenna);
        applyAntiNode(antiNodes, antiNodesPosition, otherAntenna.position, positionDiff);
      }
    };
  }

  drawMap(antennas, antiNodes, mapSize);
  return antiNodes.length;
};

const part1Solution = solvePart1();
console.log(`Part 1: ${part1Solution}`);
const part2Solution = solvePart2();
console.log(`Part 2: ${part2Solution}`);
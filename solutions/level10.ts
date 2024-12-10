import { readLevel } from "aoc-util";

type Position = {
  x: number,
  y: number,
};

type TrailCell = {
  position: Position,
  height: number,
};

type TrailCache = {
  addTrail: (trail: TrailCell) => void,
  hasTrail: (trail: TrailCell) => boolean,
}

const createTrailCache = (): TrailCache => {
  const visitedTrails: string[] = [];

  const addTrail = (trail: TrailCell) => {
    visitedTrails.push(`${trail.position.x},${trail.position.y}`);
  };

  const hasTrail = (trail: TrailCell) => {
    return visitedTrails.includes(`${trail.position.x},${trail.position.y}`);
  };

  return {
    addTrail,
    hasTrail
  };
};

const input = await readLevel<TrailCell[]>({
  level: 10,
  year: 2024,
  parser: (lines) => {
    const trailCells: TrailCell[] = [];

    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        if (lines[y][x] === '.') continue;
        const height = parseInt(lines[y][x]);
        trailCells.push({ position: { x, y }, height });
      }
    }

    return trailCells;
  }
});

const getNeighbors = (cell: TrailCell): TrailCell[] => {
  const top = input.find(c => c.position.x === cell.position.x && c.position.y === cell.position.y - 1);
  const right = input.find(c => c.position.x === cell.position.x + 1 && c.position.y === cell.position.y);
  const bottom = input.find(c => c.position.x === cell.position.x && c.position.y === cell.position.y + 1);
  const left = input.find(c => c.position.x === cell.position.x - 1 && c.position.y === cell.position.y);

  return [
    ...(top && top.height === cell.height + 1 ? [top] : []),
    ...(right && right.height === cell.height + 1 ? [right] : []),
    ...(bottom && bottom.height === cell.height + 1 ? [bottom] : []),
    ...(left && left.height === cell.height + 1 ? [left] : []),
  ];
};

const followTrail = (cache: TrailCache, trailCell: TrailCell): TrailCell[] => {
  const result: TrailCell[] = [];

  if (trailCell.height === 9 && !cache.hasTrail(trailCell)) {
    cache.addTrail(trailCell);
    result.push(trailCell);
    return result;
  }

  const neighbors = getNeighbors(trailCell);

  if (neighbors.length === 0) {
    return result;
  } else {
    neighbors.forEach(neighbor => {
      result.push(...followTrail(cache, neighbor));
    });

    return result;
  }
};

const solvePart1 = (trailHeads: TrailCell[]) => {
  return trailHeads.map(trailHead => {
    const cache = createTrailCache();
    return followTrail(cache, trailHead).length;
  }).reduce((acc, curr) => acc + curr, 0);
};

const solvePart2 = (trailHeads: TrailCell[]) => {
  return trailHeads.map(trailHead => {
    const cache: TrailCache = {
      addTrail: () => { },
      hasTrail: () => false,
    };
    return followTrail(cache, trailHead).length;
  }).reduce((acc, curr) => acc + curr, 0);
};

const trailHeads = input.filter(cell => cell.height === 0);
const part1Solution = solvePart1(trailHeads);
console.log(`Part 1: ${part1Solution}`);
const part2Solution = solvePart2(trailHeads);
console.log(`Part 2: ${part2Solution}`);
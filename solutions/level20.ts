import { readLevel } from "aoc-util"

type Vec = {
  x: number;
  y: number;
};

const offsets: Vec[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

type MazeCell = "#" | "." | "S" | "E";

type MazeMap = {
  setPoint: (target: "S" | "E", pos: Vec) => void;
  getStart: () => Vec;
  getEnd: () => Vec;
  set: (pos: Vec, value: string) => void;
  get: (pos: Vec) => MazeCell | undefined;
  has: (pos: Vec) => boolean;
  memory: Map<string, MazeCell>;
}

const applyVec = (pos: Vec, offset: Vec): Vec => {
  return {
    x: pos.x + offset.x,
    y: pos.y + offset.y,
  };
};

const drawMaze = (maze: MazeMap, visited: Vec[]) => {
  const minX = Math.min(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[0])));
  const maxX = Math.max(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[0])));
  const minY = Math.min(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[1])));
  const maxY = Math.max(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[1])));

  for (let y = minY; y <= maxY; y++) {
    let row = "";
    for (let x = minX; x <= maxX; x++) {
      const pos = { x, y };
      if (visited.some(v => v.x === pos.x && v.y === pos.y)) {
        row += "█";
      } else {
        row += maze.get(pos) || ".";
      }
    }
    console.log(row);
  }
}

const createMazeMap = (): MazeMap => {
  const memory: Map<string, MazeCell> = new Map();
  let start: Vec | null = null;
  let end: Vec | null = null;

  return {
    setPoint: (target: "S" | "E", pos: Vec) => {
      if (target === "S") {
        start = pos;
      } else {
        end = pos;
      }
    },
    getStart: () => start!,
    getEnd: () => end!,
    set: (pos: Vec, value: string) => {
      memory.set(`${pos.x},${pos.y}`, value as MazeCell);
    },
    get: (pos: Vec) => {
      return memory.get(`${pos.x},${pos.y}`);
    },
    has: (pos: Vec) => {
      return memory.has(`${pos.x},${pos.y}`);
    },
    memory,
  };
};

const readInput = (): Promise<MazeMap> => {
  return readLevel({
    level: 20,
    year: 2024,
    parser: (lines) => {
      const map = createMazeMap();

      for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
          const mapVal = lines[y][x];
          if (mapVal === 'S' || mapVal === 'E') {
            map.setPoint(mapVal, { x, y });
          }
          map.set({ x, y }, lines[y][x]);
        }
      }

      return map;
    }
  })
};

const traverseMaze = (pos: Vec, visited: Vec[], end: Vec) => {
  const nextPositions = offsets.map(offset => applyVec(pos, offset));
  for (const nextPos of nextPositions) {
    if (nextPos.x === end.x && nextPos.y === end.y) {
      visited.push(nextPos);
      return visited;
    } else if (mazeMap.get(nextPos) === '.' && !visited.some(v => v.x === nextPos.x && v.y === nextPos.y)) {
      return traverseMaze(nextPos, [...visited, nextPos], end);
    }
  }
};

const createDistanceMap = (visited: Vec[]) => {
  const distanceMap: Map<string, number> = new Map();
  visited.forEach((v, i) => {
    distanceMap.set(`${v.x},${v.y}`, visited.length - i);
  });
  return distanceMap;
};

const manhattanDistance = (a: Vec, b: Vec) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const cheatTraverse = (mazeMap: MazeMap, visited: Vec[]) => {
  const distanceMap = createDistanceMap(visited);
  const cheatSum: Map<number, number> = new Map();

  for (let i = 0; i < visited.length; i++) {
    const current = visited[i];

    for (let j = 0; j < visited.length; j++) {
      if (i === j) { continue; }
      const visit = visited[j];
      const dist = manhattanDistance(current, visit);

      const distFromVisited = distanceMap.get(`${visit.x},${visit.y}`)!;
      const currentDist = distanceMap.get(`${current.x},${current.y}`)!;

      const distDiff = currentDist - distFromVisited - dist;

      if (dist <= 20 && distDiff > 2) {
        cheatSum.set(distDiff, (cheatSum.get(distDiff) || 0) + 1);
      }
    }
  }

  const sum = cheatSum.entries().reduce((acc, [key, value]) => {
    if (key >= 100) {
      acc += value;
    }
    return acc;
  }, 0);

  console.log(`At least 100 picoseconds can be saved by ${sum} cheats`);
};

const mazeMap = await readInput();
const end = mazeMap.getEnd();
const start = mazeMap.getStart();

console.time('Traverse');
const visited = traverseMaze(start, [start], end)!;
console.timeEnd('Traverse');

// drawMaze(mazeMap, visited);
console.log(`Visited ${visited.length} cells`);

cheatTraverse(mazeMap, visited);
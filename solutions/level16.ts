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
  set: (pos: Vec, value: string) => void;
  get: (pos: Vec) => MazeCell | undefined;
  has: (pos: Vec) => boolean;
  memory: Map<string, MazeCell>;
}

const createMazeMap = (): MazeMap => {
  const memory: Map<string, MazeCell> = new Map();

  return {
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

const drawMaze = (maze: MazeMap, visited: string[]) => {
  const minX = Math.min(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[0])));
  const maxX = Math.max(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[0])));
  const minY = Math.min(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[1])));
  const maxY = Math.max(...Array.from(maze.memory.keys()).map(key => Number(key.split(",")[1])));

  for (let y = minY; y <= maxY; y++) {
    let row = "";
    for (let x = minX; x <= maxX; x++) {
      const pos = { x, y };
      if (visited.includes(`${x},${y}`)) {
        row += "█";
      } else if (maze.has(pos)) {
        row += maze.get(pos);
      } else {
        row += ".";
      }
    }
    console.log(row);
  }
}

const applyVec = (pos: Vec, offset: Vec): Vec => {
  return {
    x: pos.x + offset.x,
    y: pos.y + offset.y,
  };
};

const vecDiff = (a: Vec, b: Vec): Vec => {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  };
};

const findStart = (maze: MazeMap): Vec => {
  const [startPosRaw] = maze.memory.entries().find(([_, value]) => value === "S")!;
  const [x, y] = startPosRaw.split(",").map(Number);
  return { x, y };
}

const findEnd = (maze: MazeMap): Vec => {
  const [endPosRaw] = maze.memory.entries().find(([_, value]) => value === "E")!;
  const [x, y] = endPosRaw.split(",").map(Number);
  return { x, y };
};

const calculateEndDistance = (pos: Vec, end: Vec) => {
  return Math.abs(pos.x - end.x) + Math.abs(pos.y - end.y);
};

const readInput = (): Promise<MazeMap> => {
  return readLevel({
    level: 16,
    year: 2024,
    parser: (lines) => {
      const map = createMazeMap();

      for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
          map.set({ x, y }, lines[y][x]);
        }
      }

      return map;
    }
  })
};

const maze = await readInput();

const strToVec = (str: string): Vec => {
  const [x, y] = str.split(",").map(Number);
  return { x, y };
};

const vecEqual = (a: Vec, b: Vec) => {
  return a.x === b.x && a.y === b.y;
};

const scoreCache = new Map<string, number>();

const calculateScore = (visited: string[]) => {
  if (visited.length === 0) return 0;

  if (scoreCache.has(visited.join(","))) {
    return scoreCache.get(visited.join(","))!;
  }

  let turns = 0;
  // Starts facing east
  let previousPosition = strToVec(visited[0]);
  let previousDirection = offsets[0];


  for (const visit of visited.slice(1)) {
    const currentPosition = strToVec(visit);
    const direction = vecDiff(currentPosition, previousPosition);

    if (!vecEqual(direction, previousDirection)) {
      turns += 1;
    }
    previousPosition = currentPosition;
    previousDirection = direction;
  }

  const score = turns * 1000 + visited.length - 1;
  scoreCache.set(visited.join(","), score);
  return score;
};

const traverseMazeForBestPath = (maze: MazeMap) => {
  const start = findStart(maze);
  const openSet: { pos: Vec; path: string[]; score: number }[] = [
    { pos: start, path: [], score: 0 },
  ];
  const bestScores = new Map<string, number>();

  while (openSet.length) {
    openSet.sort((a, b) => a.score - b.score);
    const { pos, path, score } = openSet.shift()!;
    const posKey = `${pos.x},${pos.y}`;

    if (bestScores.has(posKey) && bestScores.get(posKey)! <= score) continue;
    bestScores.set(posKey, score);

    if (maze.get(pos) === "E") return { path: [...path, posKey], score: score + 1 };

    for (const nextPos of offsets.map(o => applyVec(pos, o)).filter(p => maze.get(p) !== "#")) {
      const nextPosKey = `${nextPos.x},${nextPos.y}`;
      const newPath = [...path, posKey];
      const newScore = calculateScore(newPath);

      if (!bestScores.has(nextPosKey) || bestScores.get(nextPosKey)! >= newScore) {
        openSet.push({ pos: nextPos, path: newPath, score: newScore });
      }
    }
  }
  return null;
};

const traverseMaze = (maze: MazeMap, bestScore: number) => {
  const start = findStart(maze);
  const finishingPaths: string[][] = [];
  let iterations = 0;

  const visitStack: { pos: Vec; visited: string[] }[] = [
    { pos: start, visited: [] },
  ];

  while (visitStack.length > 0) {
    iterations += 1;

    if (iterations % 100000 === 0) {
      console.log(visitStack.length);
    }

    const { pos, visited } = visitStack.pop()!;
    const currentScore = calculateScore(visited || []);
    if (currentScore > bestScore) continue;

    if (!maze.has(pos) || visited.includes(`${pos.x},${pos.y}`)) {
      continue;
    } else {
      visited.push(`${pos.x},${pos.y}`);
    }

    if (maze.get(pos) === "E") {
      finishingPaths.push(visited);
      continue;
    }

    const possibleMovements = offsets
      .map(offset => applyVec(pos, offset))
      .filter(nextPos => maze.get(nextPos) !== "#")

    for (let possibleMovement of possibleMovements) {
      visitStack.push({ pos: possibleMovement, visited: Array.from(visited) });
    }

  };
  console.log(finishingPaths)
}

const res = traverseMazeForBestPath(maze);
console.log(res);
traverseMaze(maze, res!.score);
// drawMaze(maze, res!.path);
// console.log(res);
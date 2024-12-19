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

const readInput = (): Promise<MazeMap> => {
  return readLevel({
    level: 16,
    year: 2024,
    parser: (lines) => {
      const map = createMazeMap();

      for (let y = 0; y < lines.length; y++) {
        for (let x = 0; x < lines[y].length; x++) {
          const mapVal = lines[y][x];
          if (mapVal === 'S' || mapVal === 'E') {
            map.setPoint(mapVal, { x, y });
          } else {
            map.set({ x, y }, lines[y][x]);
          }
        }
      }

      return map;
    }
  })
};

const traverseMaze = (maze: MazeMap) => {
  const SPLITTER = '->';
  let bestScore = Infinity;
  const end = maze.getEnd();
  const scoreMap: Record<string, number> = {};
  const queue: { pos: Vec, direction: Vec, score: number, path: string }[] = [
    { pos: maze.getStart(), direction: offsets[0], score: 0, path: '' },
  ];
  const pathsScore: [string, number][] = [];

  while (queue.length > 0) {
    const { direction, pos, score, path } = queue.shift()!;

    const posKey = `${pos.x},${pos.y}`;
    const scoreKey = `${posKey},${direction.x},${direction.y}`;

    if (maze.get(pos) === "#" || scoreMap[scoreKey] < score) {
      continue;
    }

    const extendedPath = path + posKey + SPLITTER;
    scoreMap[scoreKey] = score;

    if (end.x === pos.x && end.y === pos.y) {
      pathsScore.push([extendedPath, score]);
      if (score < bestScore) {
        bestScore = score;
      }
      continue;
    }

    for (const move of offsets) {
      const newPos = applyVec(pos, move);
      if (maze.get(newPos) === "#" ||
        (newPos.x === pos.x && newPos.y === pos.y)) {
        continue;
      }
      const nextScore = score + (direction === move ? 1 : 1001);
      queue.push({ pos: newPos, direction: move, score: nextScore, path: extendedPath });
    }
  }

  const uniqueSeats: Set<string> = new Set();
  const bestPaths = pathsScore.filter((path) => path[1] === bestScore);

  for (const [path] of bestPaths) {
    const seats = path.split("->");
    for (const seat of seats) {
      if (seat === "") {
        continue;
      }
      uniqueSeats.add(seat);
    }
  }

  console.log(`Best score is: ${bestScore}`);
  console.log(`Unique seats: ${uniqueSeats.size}`);
};

const maze = await readInput();
traverseMaze(maze);
import { readLevel } from "aoc-util";

type Vec = {
  x: number;
  y: number;
}

type MemoryCell = "#";

type MemorySpace = ReturnType<typeof createMemorySpace>;

// const mapSize: Vec = {
//   x: 6,
//   y: 6
// };

const mapSize: Vec = {
  x: 70,
  y: 70
};

const directions: Vec[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 }
];

const applyVec = (a: Vec, b: Vec): Vec => {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  }
}

const createMemorySpace = (memory?: Vec[]) => {
  const memorySpace: Vec[] = memory ?? [];

  return {
    add: (vec: Vec) => {
      memorySpace.push(vec);
    },
    exists: ({ x, y }: Vec) => {
      return memorySpace.some(v => v.x === x && v.y === y);
    },
    clone: (size: number) => {
      return createMemorySpace(memorySpace.slice(0, size));
    },
    draw: (path: Vec[] = []) => {
      for (let y = 0; y <= mapSize.y; y++) {
        const row: string[] = [];
        for (let x = 0; x <= mapSize.x; x++) {
          if (path.some(v => v.x === x && v.y === y)) {
            row.push("█");
          } else {
            row.push(memorySpace.some(v => v.x === x && v.y === y) ? "#" : ".");
          }
        }
        console.log(row.join(''));
      }
    },
    getPixelAt: (i: number) => memorySpace[i],
    size: () => memorySpace.length
  };
};

const memorySpace = await readLevel<MemorySpace>({
  level: 18,
  year: 2024,
  parser: (lines) => {
    const memorySpace = createMemorySpace();

    for (const line of lines) {
      const [x, y] = line.split(',').map(Number);
      memorySpace.add({ x, y });
    }

    return memorySpace;
  }
});

const traverseMemory = (memorySpace: MemorySpace): number | undefined => {
  const traverseQueue: { pos: Vec, visited: Vec[] }[] = [];
  const start: Vec = { x: 0, y: 0 };
  const end: Vec = { x: mapSize.x, y: mapSize.y };

  traverseQueue.push({
    pos: start,
    visited: []
  });

  const visitedSet = new Set<string>();

  while (traverseQueue.length > 0) {
    const firstTraverse = traverseQueue.shift()!;

    const { pos, visited } = firstTraverse;

    if (pos.x === end.x && pos.y === end.y) {
      // memorySpace.draw(visited);
      return visited.length;
    }

    const posKey = `${pos.x},${pos.y}`;
    if (visitedSet.has(posKey)) {
      continue;
    }
    visitedSet.add(posKey);

    const newVisited = [...visited, pos];

    const possibleMoves = directions
      .map(d => applyVec(pos, d))
      .filter(pos => pos.x >= 0 && pos.x <= mapSize.x && pos.y >= 0 && pos.y <= mapSize.y)
      .filter(pos => !memorySpace.exists(pos) && !visitedSet.has(`${pos.x},${pos.y}`));

    for (const possibleMove of possibleMoves) {
      traverseQueue.push({
        pos: possibleMove,
        visited: newVisited
      });
    }
  }

  return undefined;
}

const solvePart1 = () => {
  // const memorySlice = memorySpace.clone(12);
  const memorySlice = memorySpace.clone(1024);
  const shortestPath = traverseMemory(memorySlice);
  console.log(`Elements: ${memorySlice.size()} - Shortest Path: ${shortestPath}`);
};

const solvePart2 = () => {
  for (let i = 0; i <= memorySpace.size(); i++) {
    const memoryCutCopy = memorySpace.clone(i);
    const result = traverseMemory(memoryCutCopy);
    if (result === undefined) {
      console.log({
        i, result, pixel: memorySpace.getPixelAt(i - 1)
      });
      break;
    }
  }
};

solvePart1();
solvePart2();
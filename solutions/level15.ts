import { readLevel } from "aoc-util";

type Vec = {
  x: number;
  y: number;
};

const offsets: Vec[] = [
  { x: 0, y: -1 },  // up
  { x: 1, y: 0 },   // right
  { x: 0, y: 1 },   // down
  { x: -1, y: 0 },  // left
];

const movementOffsets: { [key: string]: Vec } = {
  "^": offsets[0],
  ">": offsets[1],
  "v": offsets[2],
  "<": offsets[3],
};

type CellType = "robot" | "wall" | "empty" | "box" | "[" | "]";

// type Cell = {
//   position: Vec;
//   type: "robot" | "wall" | "empty" | "box";
// }

type Warehouse = Map<string, CellType>;


const applyVec = (vec: Vec, offset: Vec): Vec => {
  return {
    x: vec.x + offset.x,
    y: vec.y + offset.y,
  };
};

const mulVecHor = (vec: Vec, scalar: number): Vec => {
  return {
    x: vec.x * scalar,
    y: vec.y,
  }
};

const vecToStr = (vec: Vec): string => `${vec.x},${vec.y}`;
const strToVec = (str: string): Vec => {
  const [x, y] = str.split(',').map(Number);
  return { x, y };
};

const readInput = async () => {
  return readLevel({
    level: 15,
    year: 2024,
    splitter: /\n\n/g,
    parser: (input) => {
      const [rawWarehouse, movementsString] = input;
      const movements = movementsString.split('').filter(e => e !== '\n');
      const warehouse: Warehouse = new Map();

      const warehouseRows = rawWarehouse.split('\n');
      for (let y = 0; y < warehouseRows.length; y++) {
        const row = warehouseRows[y];
        for (let x = 0; x < row.length; x++) {
          const cell = row[x];
          if (cell === '#') {
            warehouse.set(vecToStr({ x, y }), "wall");
          } else if (cell === 'O') {
            warehouse.set(vecToStr({ x, y }), "box");
          } else if (cell === '@') {
            warehouse.set(vecToStr({ x, y }), "robot");
          } else {
            warehouse.set(vecToStr({ x, y }), "empty");
          }
        }
      }

      return {
        movements, warehouse
      };
    }
  });
}

const drawWarehouse = (warehouse: Warehouse) => {
  const warehouseSize = {
    x: Math.max(...Array.from(warehouse.keys()).map(strToVec).map(vec => vec.x)),
    y: Math.max(...Array.from(warehouse.keys()).map(strToVec).map(vec => vec.y)),
  };

  for (let y = 0; y <= warehouseSize.y; y++) {
    let row = "";
    for (let x = 0; x <= warehouseSize.x; x++) {
      const cell = warehouse.get(vecToStr({ x, y }));
      if (cell === "wall") {
        row += "#";
      } else if (cell === "[" || cell === "]") {
        row += cell;
      } else if (cell === "box") {
        row += "O";
      } else if (cell === "robot") {
        row += "@";
      } else if (cell === 'empty') {
        row += ".";
      }
    }
    console.log(row);
  }
};

const moveBox = (warehouse: Warehouse, boxPos: Vec, direction: Vec) => {
  const newBoxPos = applyVec(boxPos, direction);
  const newBoxCell = warehouse.get(vecToStr(newBoxPos));
  if (newBoxCell === 'box') {
    moveBox(warehouse, newBoxPos, direction);
    warehouse.set(vecToStr(boxPos), "empty");
    warehouse.set(vecToStr(newBoxPos), "box");
  } else if (newBoxCell === 'empty') {
    warehouse.set(vecToStr(boxPos), "empty");
    warehouse.set(vecToStr(newBoxPos), "box");
  }
}

const canMoveBox = (warehouse: Warehouse, boxPos: Vec, direction: Vec): boolean => {
  const newBoxPos = applyVec(boxPos, direction);
  const newBoxCell = warehouse.get(vecToStr(newBoxPos));
  if (newBoxCell === 'box' || newBoxCell === '[' || newBoxCell === ']') {
    return canMoveBox(warehouse, newBoxPos, direction);
  } else if (newBoxCell === 'wall') {
    return false;
  } else if (newBoxCell === 'empty') {
    return true;
  }

  return false;
};

const getBoxScore = (pos: Vec) => {
  return pos.y * 100 + pos.x;
};

const solvePart1 = async () => {
  const { movements, warehouse } = await readInput();

  const robot = warehouse.entries().find(([_, type]) => type === "robot")!;
  let robotPos = strToVec(robot[0]);

  for (const movement of movements) {
    const movementOffset = movementOffsets[movement];
    const newRobotPosition = applyVec(robotPos, movementOffset);
    const newRobotCell = warehouse.get(vecToStr(newRobotPosition));

    if (newRobotCell === "empty") {
      // move
      warehouse.set(vecToStr(robotPos), "empty");
      warehouse.set(vecToStr(newRobotPosition), "robot");
      robotPos = newRobotPosition;
    } else if (newRobotCell === "wall") {
      // cant move
    } else if (newRobotCell === "box") {
      if (canMoveBox(warehouse, newRobotPosition, movementOffset)) {
        moveBox(warehouse, newRobotPosition, movementOffset);
        warehouse.set(vecToStr(robotPos), "empty");
        warehouse.set(vecToStr(newRobotPosition), "robot");
        robotPos = newRobotPosition
      }
    }
  }

  drawWarehouse(warehouse);

  const score = Array.from(warehouse.keys()).map(e => strToVec(e)).reduce((acc, pos) => {
    if (warehouse.get(vecToStr(pos)) === "box") {
      return acc + getBoxScore(pos);
    }
    return acc;
  }, 0);
  console.log(score);
};

const moveBiggerBox = (warehouse: Warehouse, boxPos: Vec, direction: Vec) => {
  const boxType = warehouse.get(vecToStr(boxPos))!;
  const neighborPos = applyVec(boxPos, boxType === '[' ? movementOffsets['>'] : movementOffsets['<']);

  const nextBoxPos = applyVec(boxPos, direction);
  const nextNeighborPos = applyVec(neighborPos, direction);

  const nextNeighborType = warehouse.get(vecToStr(nextNeighborPos));
  const nextBoxType = warehouse.get(vecToStr(nextBoxPos));

  if (direction === movementOffsets['>'] || direction === movementOffsets['<']) {
    if (nextNeighborType === 'empty') {
      warehouse.set(vecToStr(boxPos), 'empty');
      warehouse.set(vecToStr(neighborPos), 'empty');
      warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
      warehouse.set(vecToStr(nextBoxPos), boxType);
    } else {
      moveBiggerBox(warehouse, nextBoxPos, direction);
      warehouse.set(vecToStr(boxPos), 'empty');
      warehouse.set(vecToStr(neighborPos), 'empty');
      warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
      warehouse.set(vecToStr(nextBoxPos), boxType);
    }
    return;
  }

  if (nextBoxType === 'empty' && nextNeighborType === 'empty') {
    warehouse.set(vecToStr(boxPos), 'empty');
    warehouse.set(vecToStr(neighborPos), 'empty');
    warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
    warehouse.set(vecToStr(nextBoxPos), boxType);
    return;
  }

  if ((nextNeighborType === '[' || nextNeighborType === ']') && nextBoxType === 'empty') {
    moveBiggerBox(warehouse, nextNeighborPos, direction);
    warehouse.set(vecToStr(boxPos), 'empty');
    warehouse.set(vecToStr(neighborPos), 'empty');
    warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
    warehouse.set(vecToStr(nextBoxPos), boxType);
    return;
  }

  if ((nextBoxType === '[' || nextBoxType === ']') && nextNeighborType === 'empty') {
    moveBiggerBox(warehouse, nextBoxPos, direction);
    warehouse.set(vecToStr(boxPos), 'empty');
    warehouse.set(vecToStr(neighborPos), 'empty');
    warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
    warehouse.set(vecToStr(nextBoxPos), boxType);
    return;
  }

  if (nextBoxType === boxType) {
    moveBiggerBox(warehouse, nextBoxPos, direction);
    warehouse.set(vecToStr(boxPos), 'empty');
    warehouse.set(vecToStr(neighborPos), 'empty');
    warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
    warehouse.set(vecToStr(nextBoxPos), boxType);
    return;
  }

  if ((nextBoxType === '[' || nextBoxType === ']') && (nextNeighborType === '[' || nextNeighborType === ']')) {
    moveBiggerBox(warehouse, nextBoxPos, direction);
    moveBiggerBox(warehouse, nextNeighborPos, direction);
    warehouse.set(vecToStr(boxPos), 'empty');
    warehouse.set(vecToStr(neighborPos), 'empty');
    warehouse.set(vecToStr(nextNeighborPos), boxType === '[' ? ']' : '[');
    warehouse.set(vecToStr(nextBoxPos), boxType);
    return;
  }

};

const canMoveBiggerBox = (warehouse: Warehouse, boxPos: Vec, direction: Vec): boolean => {
  const boxType = warehouse.get(vecToStr(boxPos));
  const neighborPos = applyVec(boxPos, boxType === '[' ? movementOffsets['>'] : movementOffsets['<']);

  const nextBoxPos = applyVec(boxPos, direction);
  const nextNeighborPos = applyVec(neighborPos, direction);

  const nextBoxType = warehouse.get(vecToStr(nextBoxPos));
  const nextNeighborType = warehouse.get(vecToStr(nextNeighborPos));

  if (direction === movementOffsets['>'] || direction === movementOffsets['<']) {
    return canMoveBox(warehouse, neighborPos, direction);
  }

  if (nextBoxType === 'empty' && nextNeighborType === 'empty') {
    return true;
  } else if (nextBoxType === 'wall' || nextNeighborType === 'wall') {
    return false;
  }

  if ((nextBoxType === '[' || nextBoxType === ']') && (nextNeighborType === '[' || nextNeighborType === ']')) {
    return canMoveBiggerBox(warehouse, nextBoxPos, direction) &&
      canMoveBiggerBox(warehouse, nextNeighborPos, direction);
  }

  if (nextBoxType === '[' || nextBoxType === ']' && nextNeighborType === 'empty') {
    return canMoveBiggerBox(warehouse, nextBoxPos, direction);
  }

  if (nextNeighborType === '[' || nextNeighborType === ']' && nextBoxType === 'empty') {
    return canMoveBiggerBox(warehouse, nextNeighborPos, direction);
  }

  return false;
};

const resizeMap = (warehouse: Warehouse) => {
  const biggerWarehouse: Warehouse = new Map();
  for (const [pos, type] of warehouse.entries()) {
    const posVec = mulVecHor(strToVec(pos), 2);
    const posVecStr = vecToStr(posVec);
    const additionalPos = vecToStr(applyVec(posVec, { x: 1, y: 0 }));
    if (type === "wall") {
      biggerWarehouse.set(posVecStr, type);
      biggerWarehouse.set(additionalPos, type);
    } else if (type === "box") {
      biggerWarehouse.set(posVecStr, '[');
      biggerWarehouse.set(additionalPos, ']');
    } else if (type === "robot") {
      biggerWarehouse.set(posVecStr, type);
      biggerWarehouse.set(additionalPos, 'empty');
    } else if (type === "empty") {
      biggerWarehouse.set(posVecStr, type);
      biggerWarehouse.set(additionalPos, type);
    }
  }

  return biggerWarehouse;
};

const solvePart2 = async () => {
  const { movements, warehouse } = await readInput();

  const biggerWarehouse = resizeMap(warehouse);
  const robot = biggerWarehouse.entries().find(([_, type]) => type === "robot")!;
  let robotPos = strToVec(robot[0]);

  for (const movement of movements) {
    const movementOffset = movementOffsets[movement];
    const newRobotPosition = applyVec(robotPos, movementOffset);
    const newRobotCell = biggerWarehouse.get(vecToStr(newRobotPosition));

    if (newRobotCell === "empty") {
      // move
      biggerWarehouse.set(vecToStr(robotPos), "empty");
      biggerWarehouse.set(vecToStr(newRobotPosition), "robot");
      robotPos = newRobotPosition;
    } else if (newRobotCell === "wall") {
      // cant move
    } else if (newRobotCell === "[" || newRobotCell === "]") {
      if (canMoveBiggerBox(biggerWarehouse, newRobotPosition, movementOffset)) {
        moveBiggerBox(biggerWarehouse, newRobotPosition, movementOffset);
        biggerWarehouse.set(vecToStr(robotPos), "empty");
        biggerWarehouse.set(vecToStr(newRobotPosition), "robot");
        robotPos = newRobotPosition
      }
    }
  }


  const score = Array.from(biggerWarehouse.keys().map(e => strToVec(e)).filter(vec => biggerWarehouse.get(vecToStr(vec)) === "[")).reduce((acc, pos) => {
    return acc + pos.y * 100 + pos.x;
  }, 0);
  console.log(score);
};

// await solvePart1();
await solvePart2();
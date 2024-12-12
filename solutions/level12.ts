import { readLevel } from "aoc-util";

type Position = {
  x: number;
  y: number;
}

const calculatePosition = (position: Position, offset: Position): Position => {
  return {
    x: position.x + offset.x,
    y: position.y + offset.y
  };
};

type Plant = {
  position: Position;
  edges: ("top" | "right" | "bottom" | "left")[];
  corners: {
    topLeft: boolean;
    topRight: boolean;
    bottomLeft: boolean;
    bottomRight: boolean;
  }
}

type Region = {
  label: string;
  area: number;
  perimeter: number;
  plants: Plant[];
  uniqueEdges: number;
}

const visitedPosition: Position[] = [];

const offsets: Position[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

const input = await readLevel({
  level: 12,
  year: 2024,
  parser: (lines) => lines.map((line) => line.split(""))
});

const isPositionVisited = (positions: Position[], position: Position): boolean => {
  return positions.some((pos) => pos.x === position.x && pos.y === position.y);
};

const inBounds = (map: string[][], position: Position): boolean => {
  return position.x >= 0 && position.x < map[0].length && position.y >= 0 && position.y < map.length;
};

const followPlant = (map: string[][], position: Position): Plant[] => {
  if (isPositionVisited(visitedPosition, position)) {
    return [];
  };

  const plants: Plant[] = [];
  const plantLabel = map[position.y][position.x];

  const neighborsPosition = offsets
    .map((offset) => calculatePosition(position, offset));

  const neighbors = neighborsPosition
    .filter(pos => inBounds(map, pos))
    .map(pos => ({ position: pos, label: map[pos.y][pos.x] }));

  const sameNeighbors = neighbors.filter(n => n.label === plantLabel);

  const edges = neighborsPosition
    .map((pos) => {
      if (!inBounds(map, pos) ||
        (pos && map[pos.y] && map[pos.y][pos.x] !== plantLabel)) {
        return pos.x === position.x ? (pos.y > position.y ? "bottom" : "top") : (pos.x > position.x ? "right" : "left");
      }
    })
    .filter(e => e !== undefined)

  plants.push({
    position: { ...position },
    edges,
    corners: {
      bottomLeft: false,
      bottomRight: false,
      topLeft: false,
      topRight: false
    }
  });
  visitedPosition.push(position);

  for (const neighbor of sameNeighbors) {
    if (isPositionVisited(visitedPosition, neighbor.position)) {
      continue;
    }
    plants.push(...followPlant(map, neighbor.position));
  }

  return plants;
};

const findAllRegions = (map: string[][]): Region[] => {
  const regions: Region[] = [];

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {

      if (isPositionVisited(visitedPosition, { x, y })) {
        continue;
      } else {
        const plants = followPlant(map, { x, y });
        const perimeter = plants.reduce((acc, plant) => acc + plant.edges.length, 0);
        regions.push({
          label: map[y][x],
          area: plants.length,
          perimeter,
          plants,
          uniqueEdges: 0
        });
      }
    }
  }
  return regions;
};

const countPlotsPrices = (regions: Region[]): number => {
  return regions.reduce((acc, region) => {
    const price = region.area * region.perimeter;
    return acc + price;
  }, 0);
};

const solvePart1 = (regions: Region[]) => {
  return countPlotsPrices(regions);
};

const countSides = (regions: Region[]) => {
  for (const region of regions) {
    let corners = 0;
    for (const plant of region.plants) {

      const topNeighbor = region.plants.find(p => p.position.x === plant.position.x && p.position.y === plant.position.y - 1);
      const bottomNeighbor = region.plants.find(p => p.position.x === plant.position.x && p.position.y === plant.position.y + 1);

      if (plant.edges.includes("top") && plant.edges.includes("left")) {
        plant.corners.topLeft = true;
      }
      if (plant.edges.includes("top") && plant.edges.includes("right")) {
        plant.corners.topRight = true;
      }
      if (plant.edges.includes("bottom") && plant.edges.includes("left")) {
        plant.corners.bottomLeft = true;
      }
      if (plant.edges.includes("bottom") && plant.edges.includes("right")) {
        plant.corners.bottomRight = true;
      }

      if (topNeighbor) {
        if (!plant.edges.includes("right") && topNeighbor.edges.includes("right")) {
          plant.corners.topRight = true;
        }
        if (!plant.edges.includes("left") && topNeighbor.edges.includes("left")) {
          plant.corners.topLeft = true;
        }
      }

      if (bottomNeighbor) {
        if (!plant.edges.includes("right") && bottomNeighbor.edges.includes("right")) {
          plant.corners.bottomRight = true;
        }
        if (!plant.edges.includes("left") && bottomNeighbor.edges.includes("left")) {
          plant.corners.bottomLeft = true;
        }
      }

      plant.corners.topLeft && corners++;
      plant.corners.topRight && corners++;
      plant.corners.bottomLeft && corners++;
      plant.corners.bottomRight && corners++;
    }
    region.uniqueEdges = corners;
  }
};

const solvePart2 = (regions: Region[]) => {
  return regions.reduce((acc, region) => {
    acc += region.uniqueEdges * region.area;
    return acc;
  }, 0);
};

const regions = findAllRegions(input);
countSides(regions);

const part1Solution = solvePart1(regions);
console.log(`Part 1: ${part1Solution}`);

const part2Solution = solvePart2(regions);
console.log(`Part 2: ${part2Solution}`);
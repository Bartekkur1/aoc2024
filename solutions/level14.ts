import { readLevel } from "aoc-util";
import { Jimp } from 'jimp';

type Vec = {
  x: number,
  y: number
};

type Robot = {
  position: Vec,
  velocity: Vec,
};

const mapSize: Vec = {
  x: 101,
  y: 103,
};


const saveImage = async (robots: Robot[], sec: number) => {
  const image = new Jimp({
    width: mapSize.x,
    height: mapSize.y,
    color: 0xffffffff,
  });
  for (const robot of robots) {
    image.setPixelColor(0xFF000000, robot.position.x, robot.position.y);
  }

  await image.write(`./${sec}.png`);
};

const vecFromArr = (arr: string[]) => {
  return {
    x: parseInt(arr[0]),
    y: parseInt(arr[1]),
  };
};

const robots = await readLevel({
  level: 14,
  year: 2024,
  parser: (lines) => {
    const robots: Robot[] = [];
    for (const line of lines) {
      const nums = line.match(/(-\d+)|\d+/g);
      if (nums === null) {
        continue;
      }

      const position = vecFromArr(nums.slice(0, 2));
      const velocity = vecFromArr(nums.slice(2, 4));

      robots.push({ position, velocity });
    }
    return robots;
  }
});

// Move robot by its velocity, it its outside bounds, wrap around the edge
const moveRobot = (robot: Robot) => {
  robot.position.x = (robot.position.x + robot.velocity.x + mapSize.x) % mapSize.x;
  robot.position.y = (robot.position.y + robot.velocity.y + mapSize.y) % mapSize.y;
};

const solvePart1 = (robots: Robot[]) => {
  for (let s = 0; s < 100; s++) {
    for (const robot of robots) {
      moveRobot(robot);
    }
  }

  const halfMap: Vec = {
    x: Math.floor(mapSize.x / 2),
    y: Math.floor(mapSize.y / 2),
  };

  const quadrants: { [key: number]: number } = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };

  for (let x = 0; x < mapSize.x; x++) {
    if (x === halfMap.x) {
      continue;
    }
    for (let y = 0; y < mapSize.y; y++) {
      if (y === halfMap.y) {
        continue;
      }
      const quad = (x < halfMap.x ? 1 : 2) + (y < halfMap.y ? 0 : 2);
      const robotsCount = robots.filter(r => r.position.x === x && r.position.y === y).length;
      quadrants[quad] += robotsCount;
    }
  }

  const sum = Object.values(quadrants).reduce((acc, val) => acc * val, 1);
  return sum;
};

const solvePart2 = async (robots: Robot[]) => {
  let treeFound = false;
  let sec = 0;

  while (!treeFound) {
    for (const robot of robots) {
      moveRobot(robot);
    }

    for (let y = 0; y < mapSize.y; y++) {
      if (treeFound) {
        break;
      }
      let sum = 0;
      for (let x = 0; x < mapSize.x; x++) {
        const robotFound = robots.some(r => r.position.x === x && r.position.y === y);
        if (robotFound) {
          sum += 1;
        } else {
          if (sum > 30 && !treeFound) {
            console.log({
              sum, sec
            });

            await saveImage(robots, sec);
            treeFound = true;
            break;
          }
          sum = 0;
        }
      }
    }

    sec++;
  }
};

const part1Solution = await solvePart1(Array.from(robots));
console.log(`Part 1: ${part1Solution}`);

await solvePart2(Array.from(robots));
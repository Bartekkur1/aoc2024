import { readLevel } from 'aoc-util';

type Group = {
  id: string;
  indexes: number[];
}

const input = await readLevel({
  level: 9,
  year: 2024,
  parser: (lines) => {
    return lines[0].split('').map(Number);
  }
});

const mapToDiskSpace = (input: number[]): string[] => {
  let diskSpace: string[] = [];
  let memoryIndex = 0;
  for (let i = 0; i < input.length; i++) {
    if ((i - 1) % 2 === 0) {
      diskSpace.push(...Array.from({ length: input[i] }).map(() => '.'));
    } else {
      diskSpace.push(...Array.from({ length: input[i] }).map(() => memoryIndex.toString()));
      memoryIndex += 1;
    }
  }

  return diskSpace;
};

const reduceEmptySpace = (diskSpace: string[]): string[] => {
  let lastEmptyIndex = diskSpace.length - 1;
  for (let i = 0; i < diskSpace.length; i++) {
    if (diskSpace[i] === '.') {
      for (let j = lastEmptyIndex; j > i; j--) {
        if (diskSpace[j] === '.') continue;
        diskSpace[i] = diskSpace[j];
        diskSpace[j] = '.';
        lastEmptyIndex = j;
        break;
      }
    }
  }

  return diskSpace;
};

// This is so slow its not even funny anymore
const mapToGroups = (diskSpace: string[]): Group[] => {
  const groups: Group[] = [];
  let lastGroupId = diskSpace[0];
  let lastGroupIndexes = [0];

  for (let i = 1; i < diskSpace.length; i++) {
    const diskValue = diskSpace[i];
    if (diskSpace[i] === lastGroupId) {
      lastGroupIndexes.push(i);
    } else {
      groups.push({
        id: lastGroupId,
        indexes: lastGroupIndexes
      });
      lastGroupId = diskValue;
      lastGroupIndexes = [i];
    }
  }

  return [
    ...groups,
    {
      id: lastGroupId,
      indexes: lastGroupIndexes
    }
  ];
};

const findEmptyGroups = (diskSpace: string[]): Group[] => {
  const groups: Group[] = [];

  let lastGroupIndexes = [];
  for (let i = 1; i < diskSpace.length; i++) {
    if (diskSpace[i] === '.') {
      lastGroupIndexes.push(i);
    } else if (lastGroupIndexes.length > 0) {
      groups.push({
        id: '.',
        indexes: lastGroupIndexes
      });
      lastGroupIndexes = [];
    }
  }

  return groups;
};

const checkSumDisk = (diskSpace: string[]): number => {
  return diskSpace
    .reduce((acc, value, i) => {
      if (value === '.') return acc;
      acc += Number(value) * i;
      return acc;
    }, 0);
};

const solvePart1 = (): number => {
  console.log('Mapping disk space...');
  const diskSpace = mapToDiskSpace(input);
  console.log('Reducing empty space...');
  const compressed = reduceEmptySpace(diskSpace);
  console.log('Checking sum...');
  return checkSumDisk(compressed);
};

const moveFiles = (diskSpace: string[]) => {
  const groups = mapToGroups(diskSpace);
  const numericGroups = groups.filter(group => group.id !== '.').reverse();

  for (const numericGroup of numericGroups) {
    const emptySpaceGroups = findEmptyGroups(diskSpace)
      .filter(group =>
        group.indexes.length >= numericGroup.indexes.length
      );

    const leftestEmptySpaceGroup = emptySpaceGroups[0];
    if (
      leftestEmptySpaceGroup === undefined ||
      Math.max(...numericGroup.indexes) < Math.min(...leftestEmptySpaceGroup.indexes)
    ) continue;

    for (let i = 0; i < numericGroup.indexes.length; i++) {
      diskSpace[numericGroup.indexes[i]] = '.';
      diskSpace[leftestEmptySpaceGroup.indexes[i]] = numericGroup.id;
    }
  }

  return diskSpace;
};

const solvePart2 = (): number => {
  const diskSpace = mapToDiskSpace(input);
  const filesMoved = moveFiles(diskSpace);
  return checkSumDisk(filesMoved);
};

const part1Solution = solvePart1();
console.log(`Part 1: ${part1Solution}`);
const part2Solution = solvePart2();
console.log(`Part 2: ${part2Solution}`);

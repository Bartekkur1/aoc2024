import { readLevel } from "aoc-util";

type Input = {
  register: {
    A: bigint;
    B: bigint;
    C: bigint;
  },
  instructions: number[];
};

type ExecuteContext = {
  output: number[];
  instructionPointer?: number;
}

const getComboOperand = (input: Input, value: number): bigint => {
  switch (value) {
    case 0:
    case 1:
    case 2:
    case 3:
      return BigInt(value);
    case 4:
      return input.register.A;
    case 5:
      return input.register.B;
    case 6:
      return input.register.C;
    default:
      throw new Error('Invalid operand');
  }
};

const getNextInstructionPointer = (input: Input, executeContext: ExecuteContext) => {
  if (executeContext.instructionPointer === undefined) {
    executeContext.instructionPointer = 0;
  } else if (executeContext.instructionPointer >= input.instructions.length - 2) {
    executeContext.instructionPointer = undefined;
  } else {
    executeContext.instructionPointer += 2;
  }
};

const getOperant = (input: Input, executeContext: ExecuteContext) => {
  return input.instructions[executeContext.instructionPointer! + 1];
};

const executeInstruction = (input: Input, executeContext: ExecuteContext) => {
  const instruction = input.instructions[executeContext.instructionPointer!];
  const operant = getOperant(input, executeContext);
  const comboOperand = getComboOperand(input, operant);

  switch (instruction) {
    case 0:
      input.register.A /= 2n ** comboOperand;
      break;
    case 1:
      input.register.B ^= BigInt(operant);
      break;
    case 2:
      input.register.B = comboOperand % 8n;
      break;
    case 3:
      if (input.register.A !== 0n) {
        executeContext.instructionPointer = operant - 2;
      }
      break;
    case 4:
      input.register.B ^= input.register.C;
      break;
    case 5:
      executeContext.output.push(Number(comboOperand % 8n));
      break;
    case 6:
      input.register.B = input.register.A / (2n ** comboOperand);
      break;
    case 7:
      input.register.C = input.register.A / (2n ** comboOperand);
      break;
    default:
      throw new Error('Invalid instruction');
  }
};

const executeInstructions = (input: Input): string => {
  const executionContext: ExecuteContext = {
    output: [],
    instructionPointer: 0
  };

  while (executionContext.instructionPointer !== undefined) {
    executeInstruction(input, executionContext);
    getNextInstructionPointer(input, executionContext);
  }
  return executionContext.output.join(',');
};

const readInput = async () => {
  return readLevel<Input>({
    level: 17,
    year: 2024,
    parser: (lines) => {
      const input: Input = {
        register: {
          A: 0n,
          B: 0n,
          C: 0n,
        },
        instructions: []
      };
      for (const line of lines) {
        if (/Register\s[A-C]/.test(line)) {
          const match = line.match(/([A-C])\:\s(\d+)/);
          if (match === null) continue;
          const [_, registerName, value] = match;
          input.register[registerName as 'A' | 'B' | 'C'] = BigInt(parseInt(value));
        } else if (/Program/.test(line)) {
          input.instructions = line.replace('Program: ', '').split(',').map(Number);
        }
      }
      return input;
    }
  })
};

const executeInputAsync = async () => {
  const input = await readInput();
  return executeInstructions(input);
};

const executeInput = (input: Input) => {
  return executeInstructions(input);
}

const solvePart1 = async () => {
  return await executeInputAsync();
};

const solvePart2 = async () => {
  const input = await readInput();
  input.register.A = 0n;
  let a: bigint = 0n;

  for (let n = input.instructions.length - 1; n >= 0; n--) {
    a <<= 3n;

    let res = executeInput(input);
    const slice = input.instructions.slice(n, input.instructions.length).join(',')
    while (res !== slice) {
      a += 1n;
      input.register.A = a;
      res = executeInput(input);
    }
  }

  console.log(a);

  for (let i = 0; i <= a; i++) {
    const b = a - BigInt(i);
    input.register.A = b;
    const res = executeInput(input);
    if (res === input.instructions.join(',')) {
      console.log(`Found: ${b}`);
      // break;
    }
    if (res.length < 28) {
      console.log('No more pepsi, I hate this day part 2');
      break;
    }
  }
};

console.log(await solvePart1());
await solvePart2();

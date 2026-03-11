export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(gridSize = GRID_SIZE) {
  const middle = Math.floor(gridSize / 2);
  const snake = [
    { x: middle, y: middle },
    { x: middle - 1, y: middle },
    { x: middle - 2, y: middle },
  ];

  return {
    gridSize,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: createFoodPosition(gridSize, snake),
    score: 0,
    isGameOver: false,
    isStarted: false,
    isPaused: false,
  };
}

export function createFoodPosition(gridSize, snake, random = Math.random) {
  const occupied = new Set(snake.map(toKey));
  const openCells = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const key = toKey({ x, y });
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.floor(random() * openCells.length);
  return openCells[index];
}

export function queueDirection(state, nextDirection) {
  if (!(nextDirection in DIRECTION_VECTORS) || state.isGameOver) {
    return state;
  }

  const current = state.pendingDirection ?? state.direction;
  if (OPPOSITE_DIRECTIONS[current] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
  };
}

export function togglePause(state) {
  if (!state.isStarted || state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function stepGame(state, random = Math.random) {
  if (state.isGameOver || !state.isStarted || state.isPaused) {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const nextHead = getNextHead(state.snake[0], direction);

  if (isOutOfBounds(nextHead, state.gridSize) || hitsSnake(nextHead, state.snake)) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      isGameOver: true,
      isPaused: false,
    };
  }

  const ateFood = positionsEqual(nextHead, state.food);
  const nextSnake = [nextHead, ...state.snake];

  if (!ateFood) {
    nextSnake.pop();
  }

  const nextFood = ateFood
    ? createFoodPosition(state.gridSize, nextSnake, random)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: nextFood,
    score: ateFood ? state.score + 1 : state.score,
  };
}

export function startGame(state) {
  if (state.isGameOver) {
    return state;
  }

  return {
    ...state,
    isStarted: true,
    isPaused: false,
  };
}

export function restartGame(gridSize = GRID_SIZE) {
  return createInitialState(gridSize);
}

export function positionsEqual(first, second) {
  if (!first || !second) {
    return false;
  }

  return first.x === second.x && first.y === second.y;
}

function getNextHead(head, direction) {
  const vector = DIRECTION_VECTORS[direction];
  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
}

function isOutOfBounds(position, gridSize) {
  return (
    position.x < 0 ||
    position.y < 0 ||
    position.x >= gridSize ||
    position.y >= gridSize
  );
}

function hitsSnake(head, snake) {
  return snake.some((segment) => positionsEqual(segment, head));
}

function toKey(position) {
  return `${position.x},${position.y}`;
}

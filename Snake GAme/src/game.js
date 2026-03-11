import {
  GRID_SIZE,
  TICK_MS,
  createInitialState,
  queueDirection,
  restartGame,
  startGame,
  stepGame,
  togglePause,
} from "./gameLogic.js";

const boardElement = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const statusElement = document.querySelector("#status");
const restartButton = document.querySelector("#restart-button");
const pauseButton = document.querySelector("#pause-button");
const controlButtons = document.querySelectorAll("[data-direction]");

let state = createInitialState(GRID_SIZE);
let intervalId = null;

buildBoard(boardElement, GRID_SIZE);
render();

document.addEventListener("keydown", handleKeydown);
restartButton.addEventListener("click", handleRestart);
pauseButton.addEventListener("click", handlePause);
controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    applyDirection(button.dataset.direction);
  });
});

function buildBoard(board, gridSize) {
  const cells = [];
  for (let index = 0; index < gridSize * gridSize; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cells.push(cell);
  }

  board.replaceChildren(...cells);
}

function render() {
  const cells = boardElement.children;

  for (const cell of cells) {
    cell.className = "cell";
  }

  state.snake.forEach((segment, index) => {
    const cell = getCell(segment.x, segment.y);
    if (!cell) {
      return;
    }

    cell.classList.add("snake");
    if (index === 0) {
      cell.classList.add("head");
    }
  });

  if (state.food) {
    const foodCell = getCell(state.food.x, state.food.y);
    foodCell?.classList.add("food");
  }

  scoreElement.textContent = String(state.score);
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";
  statusElement.textContent = getStatusMessage(state);
}

function getCell(x, y) {
  return boardElement.children[y * GRID_SIZE + x];
}

function handleKeydown(event) {
  const direction = getDirectionFromKey(event.key);

  if (event.key === " ") {
    event.preventDefault();
    handlePause();
    return;
  }

  if (!direction) {
    return;
  }

  event.preventDefault();
  applyDirection(direction);
}

function applyDirection(direction) {
  const nextState = queueDirection(startGame(state), direction);
  state = nextState;
  ensureTimer();
  render();
}

function handlePause() {
  state = togglePause(state);
  ensureTimer();
  render();
}

function handleRestart() {
  state = restartGame(GRID_SIZE);
  ensureTimer();
  render();
}

function ensureTimer() {
  const shouldRun = state.isStarted && !state.isPaused && !state.isGameOver;

  if (shouldRun && !intervalId) {
    intervalId = window.setInterval(() => {
      state = stepGame(state);
      if (state.isGameOver) {
        ensureTimer();
      }
      render();
    }, TICK_MS);
  }

  if (!shouldRun && intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function getDirectionFromKey(key) {
  switch (key.toLowerCase()) {
    case "arrowup":
    case "w":
      return "up";
    case "arrowdown":
    case "s":
      return "down";
    case "arrowleft":
    case "a":
      return "left";
    case "arrowright":
    case "d":
      return "right";
    default:
      return null;
  }
}

function getStatusMessage(currentState) {
  if (currentState.isGameOver) {
    return "Game over. Press Restart to play again.";
  }

  if (!currentState.isStarted) {
    return "Press any arrow key or WASD to start.";
  }

  if (currentState.isPaused) {
    return "Paused.";
  }

  return "Collect food and avoid the walls and yourself.";
}

import test from "node:test";
import assert from "node:assert/strict";

import {
  createFoodPosition,
  createInitialState,
  queueDirection,
  startGame,
  stepGame,
  togglePause,
} from "../src/gameLogic.js";

test("moves the snake one cell in the queued direction", () => {
  let state = createInitialState(8);
  state = startGame(state);
  state = stepGame(state);

  assert.deepEqual(state.snake[0], { x: 5, y: 4 });
  assert.equal(state.score, 0);
});

test("prevents reversing directly into the snake", () => {
  const state = queueDirection(createInitialState(8), "left");

  assert.equal(state.pendingDirection, "right");
});

test("grows and scores when food is eaten", () => {
  let state = createInitialState(8);
  state = {
    ...startGame(state),
    food: { x: 5, y: 4 },
  };

  state = stepGame(state, () => 0);

  assert.equal(state.score, 1);
  assert.equal(state.snake.length, 4);
  assert.notDeepEqual(state.food, { x: 5, y: 4 });
});

test("ends the game on wall collision", () => {
  let state = createInitialState(4);
  state = {
    ...startGame(state),
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: "right",
    pendingDirection: "right",
  };

  state = stepGame(state);

  assert.equal(state.isGameOver, true);
});

test("ends the game on self collision", () => {
  const state = {
    ...startGame(createInitialState(6)),
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ],
    direction: "up",
    pendingDirection: "up",
    food: { x: 5, y: 5 },
  };

  const nextState = stepGame(state);

  assert.equal(nextState.isGameOver, true);
});

test("food placement skips occupied snake cells", () => {
  const food = createFoodPosition(
    3,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
    () => 0,
  );

  assert.deepEqual(food, { x: 2, y: 2 });
});

test("pause prevents game steps until resumed", () => {
  let state = startGame(createInitialState(8));
  state = togglePause(state);

  const pausedState = stepGame(state);
  assert.deepEqual(pausedState.snake, state.snake);

  const resumedState = togglePause(pausedState);
  const steppedState = stepGame(resumedState);
  assert.notDeepEqual(steppedState.snake, state.snake);
});

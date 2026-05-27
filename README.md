# Chess Puzzles for Claude Code

A [Claude Code](https://docs.anthropic.com/en/docs/claude-code) skill that serves chess puzzles right in your terminal. Fetches random tactics from [ChessBout](https://www.chessbout.com), renders a board, and lets you find the best move from 4 choices.

```
      a     b     c     d     e     f     g     h
   ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
 8 │  ♜  │     │     │  ♛  │     │  ♜  │  ♚  │     │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 7 │     │     │     │     │     │  ♟  │  ♟  │  ♟  │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 6 │     │     │  ♟  │     │     │     │     │     │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 5 │     │     │     │     │  ♕  │     │     │     │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 4 │     │     │     │     │  ♞  │     │     │     │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 3 │  ♙  │     │     │     │  ♙  │     │     │     │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 2 │     │  ♗  │     │     │     │  ♙  │  ♙  │  ♙  │
   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤
 1 │  ♖  │     │     │     │  ♔  │     │     │  ♖  │
   └─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

## Install

```
claude install-skill https://github.com/deepakpathania/chess-puzzles
```

## Usage

Type `/chess` in Claude Code to start a puzzle. You can also just ask — "give me a chess puzzle".

## How it works

1. Fetches a random tactic from the ChessBout API (medium difficulty by default)
2. Renders the board with the side to move at the bottom
3. Presents 4 candidate moves to choose from
4. Validates your answer and shows the explanation

## Requirements

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code)
- Node.js 16+

## Puzzles by ChessBout

All puzzles are sourced from [ChessBout](https://www.chessbout.com) — a chess platform with daily puzzles, leaderboards, and head-to-head duels. If you enjoy the skill, check it out.

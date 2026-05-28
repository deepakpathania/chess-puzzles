#!/usr/bin/env node

// ChessBout API client for the chess puzzle skill.
//
// Subcommands:
//   fetch [easy|medium|hard|expert]
//     → stdout: {"puzzle": {id, fen, side_to_move, option_a..d, rating, header, board}}
//        header: markdown text (rendered outside any code block)
//        board:  bordered Unicode grid (printed inside a fenced code block)
//   validate <puzzleId> <a|b|c|d>
//     → stdout: {"correct": bool, "correctOption": string, "explanation": string, "alreadyAnswered": bool}
//
// On any failure: prints {"error": "<message>"} on stderr, exits non-zero.

import https from "node:https";

const BASE = "https://www.chessbout.com";
const REQUEST_TIMEOUT_MS = 10_000;

const PIECES = {
  K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
  k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟",
};

function fenToGrid(fen) {
  return fen.split(" ")[0].split("/").map((row) => {
    const cells = [];
    for (const ch of row) {
      if (ch >= "1" && ch <= "8") for (let i = 0; i < Number(ch); i++) cells.push(" ");
      else cells.push(PIECES[ch] || ch);
    }
    return cells;
  });
}

function renderBoard(fen, sideToMove) {
  let rows = fenToGrid(fen);
  let ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  let files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  // Mirror both axes when black is to move so the black side sits at the
  // bottom of the rendered board (matches how a player sees their own pieces).
  if (sideToMove === "black") {
    rows = rows.slice().reverse().map((r) => r.slice().reverse());
    ranks = ranks.slice().reverse();
    files = files.slice().reverse();
  }
  const top = "   ┌─────" + "┬─────".repeat(7) + "┐";
  const mid = "   ├─────" + "┼─────".repeat(7) + "┤";
  const bot = "   └─────" + "┴─────".repeat(7) + "┘";
  const header = "      " + files.map((f) => `  ${f}  `).join(" ");
  const lines = [header, top];
  for (let i = 0; i < 8; i++) {
    lines.push(` ${ranks[i]} │` + rows[i].map((p) => `  ${p}  `).join("│") + "│");
    lines.push(i === 7 ? bot : mid);
  }
  return lines.join("\n");
}

function request(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      `${BASE}${path}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      },
      (res) => {
        // StringDecoder handles UTF-8 multi-byte chars (e.g. em-dash) that
        // straddle chunk boundaries; raw `chunks += buf` would corrupt them.
        res.setEncoding("utf8");
        let resp = "";
        res.on("data", (c) => (resp += c));
        res.on("error", reject);
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${resp.slice(0, 500)}`));
            return;
          }
          try {
            resolve(JSON.parse(resp));
          } catch {
            reject(new Error(`Invalid JSON response: ${resp.slice(0, 200)}`));
          }
        });
      },
    );
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

async function cmdFetch(args) {
  const difficulty = args[0] || "medium";
  const data = await request("/api/puzzles/practice", { difficulty });
  const p = data && data.puzzle;
  if (p && p.fen && p.side_to_move) {
    // header renders as markdown (bold); board is grid text for a code block.
    // Keeping them separate prevents the bold asterisks from being shown
    // literally inside the code fence.
    p.header = `**Rating: ${p.rating}** — **${p.side_to_move} to move.** Find the best move.`;
    p.board = renderBoard(p.fen, p.side_to_move);
  }
  return data;
}

async function cmdValidate(args) {
  const [idArg, picked] = args;
  if (!idArg || !picked) {
    throw new Error("Usage: node client.mjs validate <puzzleId> <a|b|c|d>");
  }
  const puzzleId = Number(idArg);
  if (!Number.isInteger(puzzleId) || puzzleId <= 0) {
    throw new Error(`Invalid puzzleId: ${idArg}`);
  }
  // timeMs/context/contextId are required by the practice endpoint for
  // server-side analytics; the values here are intentional placeholders.
  return request("/api/puzzles/validate", {
    puzzleId,
    picked,
    timeMs: 5000,
    context: "practice",
    contextId: "cli-puzzle",
  });
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "fetch":    return cmdFetch(args);
    case "validate": return cmdValidate(args);
    default:
      throw new Error("Usage: node client.mjs fetch|validate ...");
  }
}

main()
  .then((data) => console.log(JSON.stringify(data)))
  .catch((err) => {
    console.error(JSON.stringify({ error: err.message || String(err) }));
    // exitCode (not process.exit) lets Node flush stdout/stderr before exiting.
    process.exitCode = 1;
  });

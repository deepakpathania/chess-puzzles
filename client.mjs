#!/usr/bin/env node

// ChessBout API client for the chess puzzle skill.
// Usage:
//   node client.mjs fetch [easy|medium|hard|expert]
//   node client.mjs validate <puzzleId> <picked>

import https from "node:https";

const BASE = "https://www.chessbout.com";

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
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${chunks}`));
            return;
          }
          try {
            resolve(JSON.parse(chunks));
          } catch {
            reject(new Error(`Invalid JSON response: ${chunks.slice(0, 200)}`));
          }
        });
      },
    );
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error("Request timed out after 10s"));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

const [command, ...args] = process.argv.slice(2);

if (command === "fetch") {
  const difficulty = args[0] || "medium";
  request("/api/puzzles/practice", { difficulty })
    .then((data) => console.log(JSON.stringify(data)))
    .catch((err) => {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    });
} else if (command === "validate") {
  if (args.length < 2) {
    console.error(JSON.stringify({ error: "Usage: node client.mjs validate <puzzleId> <picked>" }));
    process.exit(1);
  }
  request("/api/puzzles/validate", {
    puzzleId: Number(args[0]),
    picked: args[1],
    timeMs: 5000,
    context: "practice",
    contextId: "cli-puzzle",
  })
    .then((data) => console.log(JSON.stringify(data)))
    .catch((err) => {
      console.error(JSON.stringify({ error: err.message }));
      process.exit(1);
    });
} else {
  console.error(JSON.stringify({ error: "Usage: node client.mjs fetch|validate ..." }));
  process.exit(1);
}

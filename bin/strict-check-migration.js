#!/usr/bin/env node

const args = process.argv.slice(2);

const SCRIPT_MAPPING = {
  "find-candidates": "findCandidates.js",
  "add-files": "autoAdd.js",
  "find-cycles": "findCycles.js",
  visualize: "visualize.js",
};

const scriptIndex = args.findIndex(
  (x) => Object.keys(SCRIPT_MAPPING).includes(x)
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];

function onFatalError(error) {
  process.exitCode = 2;

  console.error(`Oops! Something went wrong!: ${error.message}`);
}

(async function main() {
  process.on("uncaughtException", onFatalError);
  process.on("unhandledRejection", onFatalError);

  if (!["candidates", "add-files", "visualize"].includes(script)) {
    console.log('Unknown script "' + script + '".');
    process.exitCode(2);
    return;
  }

  process.exitCode = await require("../lib/" + SCRIPT_MAPPING[script]);
})();

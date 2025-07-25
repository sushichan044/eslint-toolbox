#!/usr/bin/env node
// @ts-check
import { run } from "../dist/index.js";

await run(process.argv.slice(2));

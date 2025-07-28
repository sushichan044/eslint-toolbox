#!/usr/bin/env node
// @ts-check
import { run } from "../dist/cli.js";

await run(process.argv.slice(2));

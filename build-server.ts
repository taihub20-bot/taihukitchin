/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

build({
  entryPoints: [path.join(__dirname, "server.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile: path.join(__dirname, "dist", "server.cjs"),
  external: ["express", "vite"],
}).catch(() => process.exit(1));

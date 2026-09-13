import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { DATASET_DIRECTORY, buildArtifacts } from "./lib/retailProfitCrisisDataset.mjs";

const first = buildArtifacts();
const second = buildArtifacts();
if (JSON.stringify(first) !== JSON.stringify(second)) {
  throw new Error("The retail-profit-crisis dataset generator is not deterministic.");
}

await mkdir(DATASET_DIRECTORY, { recursive: true });
for (const [file, content] of Object.entries(first.csvFiles)) {
  await writeFile(join(DATASET_DIRECTORY, file), content, "utf8");
}
await writeFile(join(DATASET_DIRECTORY, "data-dictionary.md"), first.dictionary, "utf8");
await writeFile(join(DATASET_DIRECTORY, "manifest.json"), first.manifest, "utf8");
await mkdir("lib/server/workSims", { recursive: true });
await writeFile("lib/server/workSims/retailProfitCrisisAnswerFixture.ts", first.fixtureSource, "utf8");

console.log(`Generated ${DATASET_DIRECTORY} (${first.dataset.orders.length} orders, ${first.dataset.orderItems.length} order items).`);

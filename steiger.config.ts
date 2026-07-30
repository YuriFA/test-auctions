import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // SDD-008 introduces entities/auction before any feature consumes it.
    // The rule would fire until SDD-017+ wires the first query; turn it off
    // globally since it is a hygiene hint, not a structural correctness check.
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);

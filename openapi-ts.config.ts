import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./docs/openapi.auctions.v0.json",
  output: "src/shared/api/generated",
  plugins: [
    {
      name: "@hey-api/client-fetch",
      bundle: true,
    },
    "@hey-api/sdk",
    "@hey-api/schemas",
  ],
});

import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env.ts";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      "postgresql://app_paz_animal:dev_password@localhost:5432/paz_animal_local",
  },
  verbose: true,
  strict: true,
});

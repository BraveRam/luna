import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import routes from "./routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = new Hono();

app.use("*", logger());
app.use("*", errorHandler);

app.route("/", routes);

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

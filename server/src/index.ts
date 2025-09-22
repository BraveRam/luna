import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import routes from "./routes.js";
import { errorHandler } from "./middleware/error-handler.ts";
import { limiter } from "./middleware/rate-limit.ts";
import { getConnInfo } from "@hono/node-server/conninfo";

const app = new Hono();

app.use("*", logger());
app.use("*", errorHandler);

app.route("/", routes);

app.get("/", (c) => {
  const info = getConnInfo(c);
  return c.text(`Your remote address is ${info.remote.address}`);
});

serve(
  {
    fetch: app.fetch,
    port: 5000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

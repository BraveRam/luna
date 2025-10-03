import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import routes from "./routes.js";
import { errorHandler } from "./middleware/error-handler.ts";
import { getConnInfo } from "@hono/node-server/conninfo";
import { cors } from "hono/cors";

const app = new Hono();


app.use("*", cors());

app.use("*", logger());
app.use("*", errorHandler);

app.route("/", routes);

app.get("/", (c) => {
  const info = getConnInfo(c);
  return c.text(`Your remote address is ${JSON.stringify(info)}`);
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

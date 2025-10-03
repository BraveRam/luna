import { Hono } from "hono";
import { clerkAuth } from "../../middleware/auth.js";

const dashboard = new Hono();

dashboard.get("/", clerkAuth, (c) => {
  return c.json({
    message: "Authenticated",
  });
});

export default dashboard;

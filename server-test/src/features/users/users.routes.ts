import { Hono } from "hono";
import { updateUser, upsertUser } from "./users.service.ts";
import { limiter } from "../../middleware/rate-limit.ts";

const users = new Hono();

users.post("/", limiter, async (c) => {
  const { id, name } = await c.req.json();

  const user = await upsertUser(id, name);

  return c.json(
    {
      message: "User created",
      user,
    },
    201
  );
});

users.patch("/", async (c) => {
  const { id, name } = await c.req.json();
  console.log("PATCH", id, name);

  const user = await updateUser(id, name);

  if (!user) {
    return c.json(
      {
        message: "User not found",
      },
      404
    );
  }

  return c.json(
    {
      message: "User updated",
      user,
    },
    200
  );
});

export default users;

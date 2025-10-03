import { Hono } from "hono";
import { upsertUser } from "./users.service.ts";
import { limiter } from "../../middleware/rate-limit.ts";
import { clerkAuth } from "../../middleware/auth.ts";

const users = new Hono();

users.post("/", limiter, clerkAuth, async (c) => {
  const { name, email } = await c.req.json();

  const user = await upsertUser({
    name,
    email
  });

  return c.json(
    {
      user,
    },
    201
  );
});

// users.patch("/", async (c) => {
//   const { id, name } = await c.req.json();
//   console.log("PATCH", id, name);

//   const user = await updateUser(id, name);

//   if (!user) {
//     return c.json(
//       {
//         message: "User not found",
//       },
//       404
//     );
//   }

//   return c.json(
//     {
//       message: "User updated",
//       user,
//     },
//     200
//   );
// });

export default users;

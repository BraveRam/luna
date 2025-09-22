import { verifyToken } from "@clerk/backend";
import type { Context, Next } from "hono";
import { env } from "../config/env.ts";

export const clerkAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  console.log(authHeader);
  //   if (!authHeader?.startsWith("Bearer ")) {
  //     return c.json(
  //       {
  //         error: "Unauthorized",
  //       },
  //       401
  //     );
  //   }

  const token = authHeader?.split(" ")[1];

  if (token === "secret") {
    c.set("userId", "secret");
    await next();
  } else {
    return c.json(
      {
        error: "Unauthorized",
      },
      401
    );
  }

  //   try {
  //     const payload = await verifyToken(token, {
  //       secretKey: env.CLERK_SECRET_KEY,
  //     });

  //     c.set("userId", payload.sub);

  //     await next();
  //   } catch (error) {
  //     return c.json(
  //       {
  //         error: "Invalid token",
  //       },
  //       401
  //     );
  //   }
};

import type { Context, Next } from "hono";

export async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    console.error("[Error]", err);

    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    return c.json({ error: message }, status);
  }
}

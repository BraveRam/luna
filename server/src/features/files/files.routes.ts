import { Hono } from "hono";
import { getMainBucketId } from "../../storage/main/index.ts";
import { getUtilsBucketId } from "../../storage/utils/index.ts";
import { env } from "../../config/env.ts";
import { limiter } from "../../middleware/rate-limit.ts";

const files = new Hono();

files.get("/", limiter, async (c) => {
  try {
    const bucketId = await getUtilsBucketId(env.BACKBLAZE_UTILS_BUCKET_NAME!);
    return c.json({
      bucketId: bucketId,
      message: "Successfully retrieved bucket ID",
    });
  } catch (error: any) {
    console.error("Files route error:", error.message);
    return c.json(
      {
        error: error.message,
      },
      500
    );
  }
});

export default files;

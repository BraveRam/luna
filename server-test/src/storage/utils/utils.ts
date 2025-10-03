import B2 from "backblaze-b2";
import dotenv from "dotenv";
import { env } from "../../config/env.ts";

dotenv.config();

export const b2 = new B2({
  applicationKeyId: env.BACKBLAZE_UTILS_KEY_ID!,
  applicationKey: env.BACKBLAZE_UTILS_APPLICATION_KEY!,
});

export const utilsInit = async () => {
  try {
    await b2.authorize();
    console.log("Utils authorized");
  } catch (error) {
    console.log(error);
  }
};

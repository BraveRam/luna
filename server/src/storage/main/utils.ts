import B2 from "backblaze-b2";
import dotenv from "dotenv";
import { env } from "../../config/env.ts";

dotenv.config();

export const b2 = new B2({
  applicationKeyId: env.BACKBLAZE_MAIN_KEY_ID!,
  applicationKey: env.BACKBLAZE_MAIN_APPLICATION_KEY!,
});

export const mainInit = async () => {
  try {
    await b2.authorize();
    console.log("Main authorized");
  } catch (error) {
    console.log(error);
  }
};

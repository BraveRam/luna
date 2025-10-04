import { env } from "../../config/env.ts";
import { b2, utilsInit } from "./utils.ts";

export async function getUtilsBucketId(bucketName: string) {
  await utilsInit();

  const result = await b2.listBuckets();
  const buckets = result.data.buckets;

  const bucket = buckets.find((b: any) => b.bucketName === bucketName);

  if (!bucket) {
    throw new Error(`Bucket "${bucketName}" not found`);
  }
  return bucket.bucketId;
}

export const uploadToUtils = async (file: Buffer, fileName: string) => {
  await utilsInit();

  const bucketId: string = await getUtilsBucketId(
    env.BACKBLAZE_UTILS_BUCKET_NAME!
  );

  const {
    data: { uploadUrl, authorizationToken },
  } = await b2.getUploadUrl({
    bucketId,
  });


  const result = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName,
    data: file,
  });
  return result.data;
};

export const downloadFile = async (fileName: string) => {
  await utilsInit();
  const result = await b2.downloadFileByName({
    bucketName: env.BACKBLAZE_UTILS_BUCKET_NAME!,
    fileName,
    responseType: "arraybuffer",
  });

  console.log("Downloaded file");

  return Buffer.from(result.data);
};

export const deleteFile = async (fileName: string) => {
  await utilsInit();

  const bucketId: string = await getUtilsBucketId(
    env.BACKBLAZE_UTILS_BUCKET_NAME!
  );

  const { data } = await b2.listFileVersions({
    bucketId,
    startFileName: fileName,
    maxFileCount: 100, 
  } as any);

    const filesToDelete = data.files.filter((file: any) => file.fileName === fileName);

    if (filesToDelete.length === 0) {
      throw new Error(`File "${fileName}" not found`);
    }

    // Delete each version
    for (const file of filesToDelete) {
      await b2.deleteFileVersion({
        fileName: file.fileName,
        fileId: file.fileId,
      });
      console.log(`Deleted file "${file.fileName}" (version ${file.fileId})`);
    }

  return { message: `Deleted ${filesToDelete.length} version(s) of file "${fileName}"` };
};
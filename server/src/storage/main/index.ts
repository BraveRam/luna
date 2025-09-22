import { env } from "../../config/env.ts";
import { b2, mainInit } from "./utils.ts";

export async function getMainBucketId(bucketName: string) {
  await mainInit();

  const result = await b2.listBuckets();
  const buckets = result.data.buckets;

  const bucket = buckets.find((b: any) => b.bucketName === bucketName);

  if (!bucket) {
    throw new Error(`Bucket "${bucketName}" not found`);
  }
  return bucket.bucketId;
}

export const uploadToMain = async (file: Buffer, fileName: string) => {
  await mainInit();

  const bucketId: string = await getMainBucketId(
    env.BACKBLAZE_MAIN_BUCKET_NAME!
  );

  const {
    data: { uploadUrl, authorizationToken },
  } = await b2.getUploadUrl({
    bucketId,
  });

  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;

  const result = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName: uniqueFileName,
    data: file,
  });
  return result.data;
};

export const getFileInfo = async (fileName: string) => {
  await mainInit();

  const bucketId: string = await getMainBucketId(
    env.BACKBLAZE_MAIN_BUCKET_NAME!
  );

  const result = await b2.listFileNames({
    bucketId,
    maxFileCount: 100,
    startFileName: "",
    delimiter: "",
    prefix: "",
  });

  const file = result.data.files.find((f: any) => f.fileName === fileName);
  if (!file) {
    throw new Error(`File "${fileName}" not found`);
  }

  return file;
};

export const downloadFile = async (fileName: string) => {
  await mainInit();
  const result = await b2.downloadFileByName({
    bucketName: env.BACKBLAZE_MAIN_BUCKET_NAME!,
    fileName,
    responseType: "blob",
  });

  return result.data;
};

export const listAllFiles = async () => {
  await mainInit();

  const bucketId: string = await getMainBucketId(
    env.BACKBLAZE_MAIN_BUCKET_NAME!
  );

  const result = await b2.listFileNames({
    bucketId,
    maxFileCount: 20,
    startFileName: "",
    delimiter: "",
    prefix: "",
  });

  return result.data.files;
};

export const getSignedUrl = async (fileName: string) => {
  await mainInit();

  const bucketId = await getMainBucketId(process.env.BACKBLAZE_BUCKET_NAME!);

  const auth = await b2.getDownloadAuthorization({
    bucketId,
    fileNamePrefix: fileName,
    validDurationInSeconds: 3600,
  });

  const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME!;

  const baseUrl = "https://f002.backblazeb2.com";

  return `${baseUrl}/file/${BUCKET_NAME}/${fileName}?Authorization=${auth.data.authorizationToken}`;
};

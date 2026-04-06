/**
 * @file Cloudflare R2 Integration Client
 * @description Client for R2 object storage (S3-compatible)
 */

import { logger } from "../../config/logger";
import type { FileUpload } from "../../common/types";
import { ServiceUnavailableError } from "../../common/errors";

/**
 * Upload file to R2
 * @param file - File upload data
 * @param folder - Folder path in bucket (e.g., "pets", "news")
 * @returns Public URL of uploaded file
 */
export async function uploadFile(file: FileUpload, folder: string): Promise<string> {
  // TODO: Implement R2 upload using AWS SDK S3 client
  // R2 is S3-compatible so we use @aws-sdk/client-s3

  logger.info({ fileName: file.originalName, folder }, "Uploading file to R2");

  throw new ServiceUnavailableError("R2 upload not yet implemented", "R2_NOT_IMPLEMENTED");

  // Example implementation:
  // const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  //
  // const s3Client = new S3Client({
  //   region: 'auto',
  //   endpoint: env.R2_ENDPOINT,
  //   credentials: {
  //     accessKeyId: env.R2_ACCESS_KEY_ID,
  //     secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  //   },
  // });
  //
  // const key = `${folder}/${generateUniqueFilename(file.originalName)}`;
  //
  // await s3Client.send(
  //   new PutObjectCommand({
  //     Bucket: env.R2_BUCKET_NAME,
  //     Key: key,
  //     Body: file.buffer,
  //     ContentType: file.mimetype,
  //   })
  // );
  //
  // return `${env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Delete file from R2
 * @param fileUrl - Full URL of file to delete
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  // TODO: Implement R2 delete

  logger.info({ fileUrl }, "Deleting file from R2");

  throw new ServiceUnavailableError("R2 delete not yet implemented", "R2_NOT_IMPLEMENTED");
}

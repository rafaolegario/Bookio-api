import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

export interface UploadParams {
  file: Buffer
  fileName: string
  contentType: string
}

export class S3StorageService {
  private client: S3Client
  private bucketName: string

  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    })
    this.bucketName = process.env.AWS_BUCKET_NAME || ''
  }

  async upload({ file, fileName, contentType }: UploadParams): Promise<string> {
    const fileKey = `${randomUUID()}-${fileName}`

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read',
    })

    await this.client.send(command)

    const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileKey}`

    return fileUrl
  }

  async delete(fileUrl: string): Promise<void> {
    const fileKey = fileUrl.split('/').pop()

    if (!fileKey) {
      throw new Error('Invalid file URL')
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    })

    await this.client.send(command)
  }
}

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
  private publicUrl: string

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID || ''

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
    this.bucketName = process.env.R2_BUCKET_NAME || ''
    this.publicUrl = process.env.R2_PUBLIC_URL || ''
  }

  async upload({ file, fileName, contentType }: UploadParams): Promise<string> {
    try {
      const fileKey = `${randomUUID()}-${fileName}`

      console.log('Upload config:', {
        bucket: this.bucketName,
        fileKey,
        contentType,
        fileSize: file.length,
      })

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file,
        ContentType: contentType,
      })

      await this.client.send(command)

      const fileUrl = `${this.publicUrl}/${fileKey}`

      console.log('Upload successful:', fileUrl)

      return fileUrl
    } catch (error) {
      console.error('R2 Upload error:', error)
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
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

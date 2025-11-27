import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaClient } from '@prisma/client'
import { CreateReaderUseCase } from '@/use-cases/account/reader/create-reader-use-case'
import { S3StorageService } from '@/services/storage/s3-storage-service'
import { NodemailerProvider } from '@/providers/nodemailer-provider'

const createReaderBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  libraryId: z.string().uuid(),
  cpf: z.string(),
  address: z.object({
    cep: z.string(),
    street: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    number: z.string(),
  }),
})

export async function CreateReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parts = request.parts()
    let pictureUrl = ''
    let bodyData: any = null

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'picture') {
        // Upload da imagem
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
        ]
        if (!allowedMimeTypes.includes(part.mimetype)) {
          return reply.status(400).send({
            message: 'Invalid file type. Only JPEG, PNG and WEBP are allowed',
          })
        }

        const maxSize = 5 * 1024 * 1024 // 5MB
        const buffer = await part.toBuffer()

        if (buffer.length > maxSize) {
          return reply.status(400).send({
            message: 'File too large. Maximum size is 5MB',
          })
        }

        const storageService = new S3StorageService()
        pictureUrl = await storageService.upload({
          file: buffer,
          fileName: part.filename,
          contentType: part.mimetype,
        })
      } else if (part.fieldname === 'data') {
        // Dados JSON
        const value = (part as any).value
        bodyData = JSON.parse(value)
      }
    }

    if (!bodyData) {
      return reply.status(400).send({
        message: 'Missing required field "data" with JSON body',
      })
    }

    const { name, email, libraryId, cpf, address } =
      createReaderBodySchema.parse(bodyData)

    const prisma = new PrismaClient()
    const readerRepository = new PrismaReaderRepository(prisma)
    const mailProvider = new NodemailerProvider()
    const createReaderUseCase = new CreateReaderUseCase(readerRepository, mailProvider)

    await createReaderUseCase.execute({
      name,
      email,
      libraryId,
      cpf,
      pictureUrl,
      Address: address,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof NotAllowedError) {
      return reply.status(409).send({ message: error.message })
    }

    console.error('Error creating reader:', error)
    return reply.status(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

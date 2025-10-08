import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaClient } from '@prisma/client'
import { UpdateReaderUseCase } from '@/use-cases/account/reader/update-reader-use-case'
import { S3StorageService } from '@/services/storage/s3-storage-service'

const updateReaderBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
  address: z
    .object({
      cep: z.string().optional(),
      street: z.string().optional(),
      neighborhood: z.string().optional(),
      city: z.string().optional(),
      number: z.string().optional(),
    })
    .optional(),
})

export async function UpdateReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { readerId } = request.params as { readerId: string }
    const parts = request.parts()
    let pictureUrl: string | undefined
    let bodyData: any = null

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'picture') {
        // Upload da nova imagem
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

    const parsedData = bodyData ? updateReaderBodySchema.parse(bodyData) : {}

    const prisma = new PrismaClient()
    const readerRepository = new PrismaReaderRepository(prisma)
    const updateReaderUseCase = new UpdateReaderUseCase(readerRepository)

    const reader = await updateReaderUseCase.execute({
      readerId,
      name: parsedData.name,
      email: parsedData.email,
      cpf: parsedData.cpf,
      pictureUrl,
      address: parsedData.address,
    })

    return reply.status(200).send({
      reader: {
        id: reader.getId().toString(),
        name: reader.getName(),
        email: reader.getEmail(),
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        address: reader.getAddress(),
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

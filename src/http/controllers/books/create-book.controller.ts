import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { CreateBookUseCase } from '@/use-cases/library/book/create-book-use-case'
import { S3StorageService } from '@/services/storage/s3-storage-service'
import { BookGenders } from '@/entities/Book'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'

const createBookBodySchema = z.object({
  libraryId: z.string().uuid(),
  author: z.string(),
  title: z.string(),
  gender: z.enum([
    'Fiction',
    'NonFiction',
    'Fantasy',
    'ScienceFiction',
    'Mystery',
    'Romance',
    'Thriller',
    'Horror',
    'Biography',
    'History',
    'Poetry',
    'SelfHelp',
  ]),
  year: z.string().transform(val => new Date(val)),
  available: z.number().int().positive(),
})

export async function CreateBookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const parts = request.parts()
    let imageUrl = ''
    let bodyData: any = null

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'image') {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
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
        imageUrl = await storageService.upload({
          file: buffer,
          fileName: part.filename,
          contentType: part.mimetype,
        })
      } else if (part.fieldname === 'data') {
        const value = (part as any).value
        bodyData = JSON.parse(value)
      }
    }

    if (!bodyData) {
      return reply.status(400).send({
        message: 'Missing required field "data" with JSON body',
      })
    }

    const { libraryId, author, title, gender, year, available } =
      createBookBodySchema.parse(bodyData)

    const prisma = new PrismaClient()
    const bookRepository = new PrismaBookRepository(prisma)
    const createBookUseCase = new CreateBookUseCase(bookRepository)

    const book = await createBookUseCase.execute({
      libraryId,
      author,
      title,
      imageUrl,
      gender: BookGenders[gender as keyof typeof BookGenders],
      year,
      available,
    })

    await prisma.$disconnect()

    return reply.status(201).send({
      book: {
        id: book.getId(),
        title: book.getTitle(),
        author: book.getAuthor(),
      }
    })
  } catch (error) {
    if (error instanceof NotAllowedError) {
      return reply.status(409).send({
        message: error.message
      })
    }

    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        message: 'Validation error',
        errors: error.issues
      })
    }

    console.error('Error creating book:', error)
    return reply.status(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

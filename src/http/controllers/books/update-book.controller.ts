import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { UpdateBookUseCase } from '@/use-cases/library/book/update-book-use-case'
import { S3StorageService } from '@/services/storage/s3-storage-service'
import { BookGenders } from '@/entities/Book'

const updateBookSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
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
  ]).optional(),
  year: z.string().transform(val => new Date(val)).optional(),
  available: z.number().int().positive().optional(),
})

export async function UpdateBookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { bookId } = request.params as { bookId: string }

  try {
    const parts = request.parts()
    let imageUrl: string | undefined
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

    const data = updateBookSchema.parse(bodyData)

    const prisma = new PrismaClient()
    const bookRepository = new PrismaBookRepository(prisma)
    const updateBookUseCase = new UpdateBookUseCase(bookRepository)

    const { book } = await updateBookUseCase.execute({
      bookId,
      title: data.title,
      author: data.author,
      imageUrl,
      gender: data.gender ? BookGenders[data.gender as keyof typeof BookGenders] : undefined,
      year: data.year,
      available: data.available,
    })

    return reply.send({
      book: {
        id: book.getId()!,
        title: book.getTitle(),
        author: book.getAuthor(),
      }
    })
  } catch (error) {
    console.error('Error updating book:', error)
    return reply.status(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

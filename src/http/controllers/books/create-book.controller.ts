import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { CreateBookUseCase } from '@/use-cases/library/book/create-book-use-case'
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
    const body = request.body as { data: string }
    const bodyData = JSON.parse(body.data)
    const { libraryId, author, title, gender, year, available } =
      createBookBodySchema.parse(bodyData)

    const bookRepository = new PrismaBookRepository(prisma)
    const createBookUseCase = new CreateBookUseCase(bookRepository)

    const book = await createBookUseCase.execute({
      libraryId,
      author,
      title,
      imageUrl: 'https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop',
      gender: BookGenders[gender as keyof typeof BookGenders],
      year,
      available,
    })

    return reply.status(201).send({
      book: {
        id: book.getId()!,
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

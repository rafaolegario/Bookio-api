import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { UpdateBookUseCase } from '@/use-cases/library/book/update-book-use-case'
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
    const bodyData = request.body

    if (!bodyData) {
      return reply.status(400).send({
        message: 'Missing required field "data" with JSON body',
      })
    }

    const data = updateBookSchema.parse(bodyData)

    const bookRepository = new PrismaBookRepository(prisma)
    const updateBookUseCase = new UpdateBookUseCase(bookRepository)

    const { book } = await updateBookUseCase.execute({
      bookId,
      title: data.title,
      author: data.author,
      imageUrl: 'https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=1356&h=668&fit=crop',
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

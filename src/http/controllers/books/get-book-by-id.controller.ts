import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { GetBookByIdUseCase } from '@/use-cases/library/book/get-book-by-id-use-case'

export async function GetBookByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { bookId } = request.params as { bookId: string }

  const bookRepository = new PrismaBookRepository(prisma)
  const getBookByIdUseCase = new GetBookByIdUseCase(bookRepository)

  const { book } = await getBookByIdUseCase.execute({ bookId })

  return reply.send({
    book: {
      id: book.getId()!,
      title: book.getTitle(),
      author: book.getAuthor(),
      gender: book.getGender(),
      year: book.getYear().toISOString(),
      available: book.getAvailable(),
      imageUrl: book.getImageUrl(),
    }
  })
}

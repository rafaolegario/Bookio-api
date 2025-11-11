import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { GetBookByTitleUseCase } from '@/use-cases/library/book/get-book-by-title-use-case'

export async function GetBookByTitleController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }
  const { title } = request.query as { title: string }

  const prisma = new PrismaClient()
  const bookRepository = new PrismaBookRepository(prisma)
  const getBookByTitleUseCase = new GetBookByTitleUseCase(bookRepository)

  const { book } = await getBookByTitleUseCase.execute({ title, libraryId })

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

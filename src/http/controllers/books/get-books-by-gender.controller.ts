import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { GetBooksByGenderUseCase } from '@/use-cases/library/book/get-books-by-gender-use-case'
import { BookGenders } from '@/entities/Book'

export async function GetBooksByGenderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { gender } = request.params as { gender: keyof typeof BookGenders }

  const bookRepository = new PrismaBookRepository(prisma)
  const getBooksByGenderUseCase = new GetBooksByGenderUseCase(bookRepository)

  const { books } = await getBooksByGenderUseCase.execute({
    gender: BookGenders[gender],
  })

  return reply.send({
    books: books.map(book => ({
      id: book.getId()!,
      title: book.getTitle(),
      author: book.getAuthor(),
      available: book.getAvailable(),
    }))
  })
}

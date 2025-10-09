import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { GetBooksByLibraryIdUseCase } from '@/use-cases/library/book/get-all-books-by-library-id-use-case'

export async function GetBooksByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

  const prisma = new PrismaClient()
  const bookRepository = new PrismaBookRepository(prisma)
  const getAllBooksUseCase = new GetBooksByLibraryIdUseCase(bookRepository)

  const { books } = await getAllBooksUseCase.execute({ libraryId })

  return reply.send({
    books: books.map(book => ({
      id: book.getId()!,
      title: book.getTitle(),
      author: book.getAuthor(),
      available: book.getAvailable(),
    }))
  })
}

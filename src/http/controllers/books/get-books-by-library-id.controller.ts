import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { GetBooksByLibraryIdUseCase } from '@/use-cases/library/book/get-all-books-by-library-id-use-case'

export async function GetBooksByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

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

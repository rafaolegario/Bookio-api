import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { GetMostBorrowedBooksUseCase } from '@/use-cases/library/book/get-most-borrowed-books-use-case'

export async function GetMostBorrowedBooksController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

  const prisma = new PrismaClient()
  const bookRepository = new PrismaBookRepository(prisma)
  const loanRepository = new PrismaLoanRepository(prisma)
  const getMostBorrowedBooksUseCase = new GetMostBorrowedBooksUseCase(
    bookRepository,
    loanRepository,
  )

  const { books } = await getMostBorrowedBooksUseCase.execute({ libraryId })

  return reply.send({ books })
}

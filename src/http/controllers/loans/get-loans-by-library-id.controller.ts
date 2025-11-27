import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { GetLoansByLibraryIdUseCase } from '@/use-cases/library/loans/get-loans-by-library-id-use-case'

export async function GetLoansByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const getLoansByLibraryIdUseCase = new GetLoansByLibraryIdUseCase(loanRepository)

  const { loans } = await getLoansByLibraryIdUseCase.execute({
    libraryId,
  })

  return reply.status(200).send({
    loans: loans.map(loan => ({
      id: loan.getId,
      bookId: loan.getBookId.toString(),
      readerId: loan.getReaderId.toString(),
      returnDate: loan.getReturnDate,
      dueDate: loan.getDueDate,
      status: loan.getStatus,
      actualReturnDate: loan.getActualReturnDate,
      createdAt: loan.getCreatedAt,
      updatedAt: loan.getUpdatedAt,
    }))
  })
}

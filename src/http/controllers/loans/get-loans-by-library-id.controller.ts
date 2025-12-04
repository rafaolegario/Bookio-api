import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { GetLoansByLibraryIdUseCase } from '@/use-cases/library/loans/get-loans-by-library-id-use-case'

export async function GetLoansByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

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
      returnedAt: loan.getReturnedAt,
      status: loan.getStatus,
      createdAt: loan.getCreatedAt(),
      updatedAt: loan.getUpdatedAt(),
    }))
  })
}

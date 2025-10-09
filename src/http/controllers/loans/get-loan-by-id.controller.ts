import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { GetLoanByIdUseCase } from '@/use-cases/library/loans/get-loan-by-id-use-case'

export async function GetLoanByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = request.params as { loanId: string }
  const { userId, role } = request.user as { userId: string, role: string }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const getLoanByIdUseCase = new GetLoanByIdUseCase(loanRepository)

  const loan = await getLoanByIdUseCase.execute({
    loanId,
    libraryId: role === 'LIBRARY' ? userId : ''
  })

  return reply.send({
    loan: {
      id: loan.getId,
      bookId: loan.getBookId.toString(),
      readerId: loan.getReaderId.toString(),
      returnDate: loan.getReturnDate,
      dueDate: loan.getDueDate,
      status: loan.getStatus,
    }
  })
}

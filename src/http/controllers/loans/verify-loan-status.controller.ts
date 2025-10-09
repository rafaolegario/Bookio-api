import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { VerifyLoanStatusUseCase } from '@/use-cases/library/loans/verify-loan-status-use-case'

export async function VerifyLoanStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = request.params as { loanId: string }
  const { userId, role } = request.user as { userId: string, role: string }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const verifyLoanStatusUseCase = new VerifyLoanStatusUseCase(loanRepository)

  const { loan, isOverdue, daysOverdue } = await verifyLoanStatusUseCase.execute({
    loanId,
    libraryId: role === 'LIBRARY' ? userId : ''
  })

  return reply.send({
    loan: {
      id: loan.getId,
      status: loan.getStatus,
    },
    isOverdue,
    daysOverdue,
  })
}

import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { VerifyLoanStatusUseCase } from '@/use-cases/library/loans/verify-loan-status-use-case'

export async function VerifyLoanStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = request.params as { loanId: string }
  const { sub: userId, role } = request.user

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

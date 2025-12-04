import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { DeleteLoanUseCase } from '@/use-cases/library/loans/delete-loan-use-case'

export async function DeleteLoanController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = request.params as { loanId: string }
  const userId = request.user.sub

  const loanRepository = new PrismaLoanRepository(prisma)
  const deleteLoanUseCase = new DeleteLoanUseCase(loanRepository)

  await deleteLoanUseCase.execute({
    loanId,
    libraryId: userId
  })

  return reply.status(204).send()
}

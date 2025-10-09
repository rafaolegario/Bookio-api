import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { DeleteLoanUseCase } from '@/use-cases/library/loans/delete-loan-use-case'

export async function DeleteLoanController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = request.params as { loanId: string }
  const { userId } = request.user as { userId: string }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const deleteLoanUseCase = new DeleteLoanUseCase(loanRepository)

  await deleteLoanUseCase.execute({
    loanId,
    libraryId: userId
  })

  return reply.status(204).send()
}

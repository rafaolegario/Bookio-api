import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { ListLoansUseCase } from '@/use-cases/library/loans/list-loans-use-case'

export async function ListLoansController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const listLoansUseCase = new ListLoansUseCase(loanRepository)

  const loans = await listLoansUseCase.execute()

  return reply.send({
    loans: loans.map(loan => ({
      id: loan.getId,
      status: loan.getStatus,
    }))
  })
}

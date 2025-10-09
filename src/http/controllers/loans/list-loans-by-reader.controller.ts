import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { ListLoansByReaderUseCase } from '@/use-cases/library/loans/list-loans-by-reader-use-case'

export async function ListLoansByReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { readerId } = request.params as { readerId: string }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const listLoansByReaderUseCase = new ListLoansByReaderUseCase(loanRepository)

  const { loans } = await listLoansByReaderUseCase.execute({ readerId })

  return reply.send({
    loans: loans.map(loan => ({
      id: loan.getId,
      status: loan.getStatus,
    }))
  })
}

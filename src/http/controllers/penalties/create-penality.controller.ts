import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { CreatePenalityUseCase } from '@/use-cases/library/penalities/create-penality-use-case'

export async function CreatePenalityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { readerId, loanId, amount, dueDate } = request.body as {
    readerId: string
    loanId: string
    amount: number
    dueDate: Date
  }

  const penalityRepository = new PrismaPenalityRepository(prisma)
  const readerRepository = new PrismaReaderRepository(prisma)
  const loanRepository = new PrismaLoanRepository(prisma)
  const bookRepository = new PrismaBookRepository(prisma)

  const createPenalityUseCase = new CreatePenalityUseCase(
    penalityRepository,
    readerRepository,
    loanRepository,
    bookRepository,
  )

  const { penality } = await createPenalityUseCase.execute({
    readerId,
    loanId,
    amount,
    dueDate,
  })

  return reply.status(201).send({
    penality: {
      id: penality.id,
      amount: penality.amount,
      paid: penality.paid,
    }
  })
}

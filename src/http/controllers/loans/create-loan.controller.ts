import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { CreateLoanUseCase } from '@/use-cases/library/loans/create-loan-use-case'
import { NodemailerProvider } from '@/providers/nodemailer-provider'

export async function CreateLoanController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { bookId, readerId, returnDate } = request.body as {
    bookId: string
    readerId: string
    returnDate: Date
  }

  const prisma = new PrismaClient()
  const loanRepository = new PrismaLoanRepository(prisma)
  const bookRepository = new PrismaBookRepository(prisma)
  const penalityRepository = new PrismaPenalityRepository(prisma)
  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const readerRepository = new PrismaReaderRepository(prisma)
  const mailProvider = new NodemailerProvider()

  const createLoanUseCase = new CreateLoanUseCase(
    loanRepository,
    bookRepository,
    penalityRepository,
    schedulingRepository,
    readerRepository,
    mailProvider,
  )

  const { loan } = await createLoanUseCase.execute({
    bookId,
    readerId,
    returnDate,
  })

  return reply.status(201).send({
    loan: {
      id: loan.getId,
      status: loan.getStatus,
    }
  })
}

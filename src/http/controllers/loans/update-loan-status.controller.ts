import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { PrismaLoanRepository } from '@/repositories/prisma/prisma-loan-repository'
import { UpdateLoanStatusUseCase } from '@/use-cases/library/loans/update-loan-status-use-case'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'

const updateLoanStatusParamsSchema = z.object({
  loanId: z.string().uuid(),
})

const updateLoanStatusBodySchema = z.object({
  status: z.enum(['Returned', 'Overdue', 'Borrowed']),
})

export async function UpdateLoanStatusController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { loanId } = updateLoanStatusParamsSchema.parse(request.params)
  const { status } = updateLoanStatusBodySchema.parse(request.body)
  const libraryId = request.user.sub

  try {
    const loanRepository = new PrismaLoanRepository(prisma)
    const updateLoanStatusUseCase = new UpdateLoanStatusUseCase(loanRepository)

    const { loan } = await updateLoanStatusUseCase.execute({
      loanId,
      libraryId,
      status,
    })

    return reply.status(200).send({
      loan,
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(400).send({ message: error.message })
    }

    throw error
  }
}

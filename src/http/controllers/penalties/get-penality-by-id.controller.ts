import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { GetPenalityByIdUseCase } from '@/use-cases/library/penalities/get-penality-by-id-use-case'

export async function GetPenalityByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { penalityId } = request.params as { penalityId: string }

  const prisma = new PrismaClient()
  const penalityRepository = new PrismaPenalityRepository(prisma)
  const getPenalityByIdUseCase = new GetPenalityByIdUseCase(penalityRepository)

  const { penality } = await getPenalityByIdUseCase.execute({ penalityId })

  return reply.send({
    penality: {
      id: penality.id,
      loanId: penality.loanId.toString(),
      amount: penality.amount,
      paid: penality.paid,
      paymentLink: penality.paymentLink,
      createdAt: penality.createdAt,
    }
  })
}

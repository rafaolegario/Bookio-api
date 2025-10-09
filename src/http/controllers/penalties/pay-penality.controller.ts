import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { PayPenalityUseCase } from '@/use-cases/library/penalities/pay-penality-use-case'

export async function PayPenalityController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { penalityId } = request.params as { penalityId: string }

  const prisma = new PrismaClient()
  const penalityRepository = new PrismaPenalityRepository(prisma)
  const payPenalityUseCase = new PayPenalityUseCase(penalityRepository)

  const { penality } = await payPenalityUseCase.execute({ penalityId })

  return reply.send({
    penality: {
      id: penality.id,
      paid: penality.paid,
    }
  })
}

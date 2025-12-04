import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { GetPenalitiesByReaderIdUseCase } from '@/use-cases/library/penalities/get-penalities-by-reader-id-use-case'

export async function GetPenalitiesByReaderIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { readerId } = request.params as { readerId: string }

  const penalityRepository = new PrismaPenalityRepository(prisma)
  const getPenalitiesByReaderIdUseCase = new GetPenalitiesByReaderIdUseCase(
    penalityRepository,
  )

  const { penalities } = await getPenalitiesByReaderIdUseCase.execute({
    readerId,
  })

  return reply.send({
    penalities: penalities.map(penality => ({
      id: penality.id,
      amount: penality.amount,
      paid: penality.paid,
    }))
  })
}

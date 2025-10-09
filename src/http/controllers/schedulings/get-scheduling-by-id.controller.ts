import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { GetSchedulingByIdUseCase } from '@/use-cases/library/scheduling/get-scheduling-by-id-use-case'

export async function GetSchedulingByIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { schedulingId } = request.params as { schedulingId: string }

  const prisma = new PrismaClient()
  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const getSchedulingByIdUseCase = new GetSchedulingByIdUseCase(
    schedulingRepository,
  )

  const { scheduling } = await getSchedulingByIdUseCase.execute({
    schedulingId,
  })

  return reply.send({
    scheduling: {
      id: scheduling.getId,
      readerId: scheduling.getReaderId,
      bookId: parseInt(scheduling.getBookId),
      status: scheduling.getStatus,
      expiresAt: scheduling.getExpiresAt,
    }
  })
}

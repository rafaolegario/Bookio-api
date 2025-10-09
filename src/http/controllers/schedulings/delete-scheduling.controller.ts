import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { DeleteSchedulingUseCase } from '@/use-cases/library/scheduling/delete-scheduling-use-case'

export async function DeleteSchedulingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { schedulingId } = request.params as { schedulingId: string }
  const { userId } = request.user as { userId: string }

  const prisma = new PrismaClient()
  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const deleteSchedulingUseCase = new DeleteSchedulingUseCase(
    schedulingRepository,
  )

  await deleteSchedulingUseCase.execute({
    schedulingId,
    readerId: userId
  })

  return reply.status(204).send()
}

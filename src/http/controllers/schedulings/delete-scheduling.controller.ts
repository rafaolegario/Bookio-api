import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { DeleteSchedulingUseCase } from '@/use-cases/library/scheduling/delete-scheduling-use-case'

export async function DeleteSchedulingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { schedulingId } = request.params as { schedulingId: string }
  const userId = request.user.sub

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

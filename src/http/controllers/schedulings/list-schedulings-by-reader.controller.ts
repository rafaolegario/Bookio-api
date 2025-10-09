import { FastifyReply, FastifyRequest } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { ListSchedulingsByReaderUseCase } from '@/use-cases/library/scheduling/list-schedulings-by-reader-use-case'

export async function ListSchedulingsByReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { readerId } = request.params as { readerId: string }

  const prisma = new PrismaClient()
  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const listSchedulingsByReaderUseCase = new ListSchedulingsByReaderUseCase(
    schedulingRepository,
  )

  const { schedulings } = await listSchedulingsByReaderUseCase.execute({
    readerId,
  })

  return reply.send({
    schedulings: schedulings.map(scheduling => ({
      id: scheduling.getId,
      bookId: parseInt(scheduling.getBookId),
      status: scheduling.getStatus,
      expiresAt: scheduling.getExpiresAt,
    }))
  })
}

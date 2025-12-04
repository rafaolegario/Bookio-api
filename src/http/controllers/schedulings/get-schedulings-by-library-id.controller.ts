import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { GetSchedulingsByLibraryIdUseCase } from '@/use-cases/library/scheduling/get-schedulings-by-library-id-use-case'

export async function GetSchedulingsByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const getSchedulingsByLibraryIdUseCase = new GetSchedulingsByLibraryIdUseCase(schedulingRepository)

  const { schedulings } = await getSchedulingsByLibraryIdUseCase.execute({
    libraryId,
  })

  return reply.status(200).send({
    schedulings: schedulings.map(scheduling => ({
      id: scheduling.getId,
      readerId: scheduling.getReaderId,
      bookId: scheduling.getBookId,
      status: scheduling.getStatus,
      createdAt: scheduling.getCreatedAt,
      expiresAt: scheduling.getExpiresAt,
      updatedAt: scheduling.getUpdatedAt,
    }))
  })
}

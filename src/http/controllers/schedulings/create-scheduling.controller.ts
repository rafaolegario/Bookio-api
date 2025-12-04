import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaSchedulingRepository } from '@/repositories/prisma/prisma-scheduling-repository'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { CreateSchedulingUseCase } from '@/use-cases/library/scheduling/create-scheduling-use-case'

export async function CreateSchedulingController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { readerId, bookId } = request.body as {
    readerId: string
    bookId: number
  }

  const schedulingRepository = new PrismaSchedulingRepository(prisma)
  const bookRepository = new PrismaBookRepository(prisma)

  const createSchedulingUseCase = new CreateSchedulingUseCase(
    schedulingRepository,
    bookRepository,
  )

  const { scheduling } = await createSchedulingUseCase.execute({
    readerId,
    bookId: bookId.toString(),
  })

  return reply.status(201).send({
    scheduling: {
      id: scheduling.getId,
      status: scheduling.getStatus,
      expiresAt: scheduling.getExpiresAt,
    }
  })
}

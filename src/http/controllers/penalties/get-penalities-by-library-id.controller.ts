import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaPenalityRepository } from '@/repositories/prisma/prisma-penality-repository'
import { GetPenalitiesByLibraryIdUseCase } from '@/use-cases/library/penalities/get-penalities-by-library-id-use-case'

export async function GetPenalitiesByLibraryIdController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { libraryId } = request.params as { libraryId: string }

  const penalityRepository = new PrismaPenalityRepository(prisma)
  const getPenalitiesByLibraryIdUseCase = new GetPenalitiesByLibraryIdUseCase(penalityRepository)

  const { penalities } = await getPenalitiesByLibraryIdUseCase.execute({
    libraryId,
  })

  return reply.status(200).send({
    penalities: penalities.map(penality => ({
      id: penality.id,
      readerId: penality.readerId,
      loanId: penality.loanId,
      amount: penality.amount,
      paid: penality.paid,
      dueDate: penality.dueDate,
      createdAt: penality.createdAt,
      updatedAt: penality.updatedAt,
    }))
  })
}

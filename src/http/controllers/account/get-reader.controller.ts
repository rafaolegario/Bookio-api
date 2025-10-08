import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaClient } from '@prisma/client'
import { GetReaderUseCase } from '@/use-cases/account/reader/get-reader-by-id-use-case'

export async function GetReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getReaderParamsSchema = z.object({
    readerId: z.string().uuid(),
  })

  const { readerId } = getReaderParamsSchema.parse(request.params)

  try {
    const prisma = new PrismaClient()
    const readerRepository = new PrismaReaderRepository(prisma)
    const getReaderUseCase = new GetReaderUseCase(readerRepository)

    const reader = await getReaderUseCase.execute({ readerId })

    return reply.status(200).send({
      reader: {
        id: reader.getId().toString(),
        name: reader.getName(),
        email: reader.getEmail(),
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        libraryId: reader.getLibraryId().toString(),
        address: reader.getAddress(),
        role: reader.getRole(),
        createdAt: reader.getCreatedAt(),
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

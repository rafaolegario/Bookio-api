import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { PrismaLibraryRepository } from '@/repositories/prisma/prisma-library-repository'
import { prisma } from '@/lib/prisma'
import { GetLibraryUseCase } from '@/use-cases/account/library/get-library-by-id-use-case'

export async function GetLibraryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getLibraryParamsSchema = z.object({
    libraryId: z.string().uuid(),
  })

  const { libraryId } = getLibraryParamsSchema.parse(request.params)

  try {
    const libraryRepository = new PrismaLibraryRepository(prisma)
    const getLibraryUseCase = new GetLibraryUseCase(libraryRepository)

    const library = await getLibraryUseCase.execute({ libraryId })

    return reply.status(200).send({
      library: {
        id: library.getId().toString(),
        name: library.getName(),
        email: library.getEmail(),
        cnpj: library.getCnpj(),
        address: library.getAddress(),
        role: library.getRole(),
        createdAt: library.getCreatedAt(),
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

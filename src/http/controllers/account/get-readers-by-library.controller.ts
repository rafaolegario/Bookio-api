import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { prisma } from '@/lib/prisma'
import { GetReadersByLibraryIdUseCase } from '@/use-cases/account/reader/get-reader-by-library-id-use-case'

export async function GetReadersByLibraryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getReadersParamsSchema = z.object({
    libraryId: z.string().uuid(),
  })

  const { libraryId } = getReadersParamsSchema.parse(request.params)

  try {
    const readerRepository = new PrismaReaderRepository(prisma)
    const getReadersByLibraryIdUseCase = new GetReadersByLibraryIdUseCase(
      readerRepository,
    )

    const readers = await getReadersByLibraryIdUseCase.execute({ libraryId })

    return reply.status(200).send({
      readers: readers.map((reader) => ({
        id: reader.getId().toString(),
        name: reader.getName(),
        email: reader.getEmail(),
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        address: reader.getAddress(),
        createdAt: reader.getCreatedAt(),
      })),
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

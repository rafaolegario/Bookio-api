import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaLibraryRepository } from '@/repositories/prisma/prisma-library-repository'
import { PrismaClient } from '@prisma/client'
import { UpdateLibraryUseCase } from '@/use-cases/account/library/update-library-use-case'

export async function UpdateLibraryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateLibraryParamsSchema = z.object({
    libraryId: z.string().uuid(),
  })

  const updateLibraryBodySchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    cnpj: z.string().optional(),
    address: z
      .object({
        cep: z.string().optional(),
        street: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        number: z.string().optional(),
      })
      .optional(),
  })

  const { libraryId } = updateLibraryParamsSchema.parse(request.params)
  const { name, email, cnpj, address } = updateLibraryBodySchema.parse(
    request.body,
  )

  try {
    const prisma = new PrismaClient()
    const libraryRepository = new PrismaLibraryRepository(prisma)
    const updateLibraryUseCase = new UpdateLibraryUseCase(libraryRepository)

    const library = await updateLibraryUseCase.execute({
      libraryId,
      name,
      email,
      cnpj,
      address,
    })

    return reply.status(200).send({
      library: {
        id: library.getId().toString(),
        name: library.getName(),
        email: library.getEmail(),
        cnpj: library.getCnpj(),
        address: library.getAddress(),
      },
    })
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    if (error instanceof NotAllowedError) {
      return reply.status(409).send({ message: error.message })
    }

    throw error
  }
}

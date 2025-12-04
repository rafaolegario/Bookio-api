import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaLibraryRepository } from '@/repositories/prisma/prisma-library-repository'
import { prisma } from '@/lib/prisma'
import { CreateLibraryUseCase } from '@/use-cases/account/library/create-library-use-case'

export async function CreateLibraryController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createLibraryBodySchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    cnpj: z.string(),
    address: z.object({
      cep: z.string(),
      street: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      number: z.string(),
    }),
  })

  const { name, email, password, cnpj, address } =
    createLibraryBodySchema.parse(request.body)

  try {
    const libraryRepository = new PrismaLibraryRepository(prisma)
    const createLibraryUseCase = new CreateLibraryUseCase(libraryRepository)

    await createLibraryUseCase.execute({
      name,
      email,
      password,
      cnpj,
      Address: address,
    })

    return reply.status(201).send()
  } catch (error) {
    if (error instanceof NotAllowedError) {
      return reply.status(409).send({ message: error.message })
    }

    console.error('Error creating library:', error)
    return reply.status(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

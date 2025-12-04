import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { prisma } from '@/lib/prisma'
import { CreateReaderUseCase } from '@/use-cases/account/reader/create-reader-use-case'

const createReaderBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  libraryId: z.string().uuid(),
  password: z.string().min(6),
  cpf: z.string(),
  address: z.object({
    cep: z.string(),
    street: z.string(),
    neighborhood: z.string(),
    city: z.string(),
    number: z.string(),
  }),
})

export async function CreateReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { name, email, libraryId, cpf, address, password } =
      createReaderBodySchema.parse(request.body)

    const readerRepository = new PrismaReaderRepository(prisma)
    const createReaderUseCase = new CreateReaderUseCase(readerRepository)
    const numero = Math.floor(Math.random() * 90)
    const { } = await createReaderUseCase.execute({
      name,
      email,
      libraryId,
      cpf,
      password,
      pictureUrl: `https://randomuser.me/api/portraits/men/${numero}.jpg`,
      Address: address,
    })

    return reply.status(201).send({
      message: 'Reader created successfully',
    })
  } catch (error) {
    if (error instanceof NotAllowedError) {
      return reply.status(409).send({ message: error.message })
    }

    console.error('Error creating reader:', error)
    return reply.status(500).send({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaClient } from '@prisma/client'
import { CreateReaderUseCase } from '@/use-cases/account/reader/create-reader-use-case'

const createReaderBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  libraryId: z.string().uuid(),
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
    const { name, email, libraryId, cpf, address } =
      createReaderBodySchema.parse(request.body)

    const prisma = new PrismaClient()
    const readerRepository = new PrismaReaderRepository(prisma)
    const createReaderUseCase = new CreateReaderUseCase(readerRepository)

    const { password } = await createReaderUseCase.execute({
      name,
      email,
      libraryId,
      cpf,
      pictureUrl: '',
      Address: address,
    })

    return reply.status(201).send({
      message: 'Reader created successfully',
      password // Retorna a senha gerada
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

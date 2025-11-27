import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'
import { PrismaReaderRepository } from '@/repositories/prisma/prisma-reader-repository'
import { PrismaClient } from '@prisma/client'
import { UpdateReaderUseCase } from '@/use-cases/account/reader/update-reader-use-case'

const updateReaderBodySchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  cpf: z.string().optional(),
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

export async function UpdateReaderController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { readerId } = request.params as { readerId: string }
    const bodyData = request.body

    const parsedData = bodyData ? updateReaderBodySchema.parse(bodyData) : {}

    const prisma = new PrismaClient()
    const readerRepository = new PrismaReaderRepository(prisma)
    const updateReaderUseCase = new UpdateReaderUseCase(readerRepository)
    const numero = Math.floor(Math.random() * 90)
    const reader = await updateReaderUseCase.execute({
      readerId,
      name: parsedData.name,
      email: parsedData.email,
      cpf: parsedData.cpf,
      pictureUrl : `https://randomuser.me/api/portraits/men/${numero}.jpg`,
      address: parsedData.address,
    })

    return reply.status(200).send({
      reader: {
        id: reader.getId().toString(),
        name: reader.getName(),
        email: reader.getEmail(),
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        address: reader.getAddress(),
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

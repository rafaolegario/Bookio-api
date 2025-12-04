import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { PrismaUserRepository } from '@/repositories/prisma/prisma-user-repository'
import { prisma } from '@/lib/prisma'
import { DeleteUserUseCase } from '@/use-cases/account/delete-user-use-case'

export async function DeleteUserController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const deleteUserParamsSchema = z.object({
    userId: z.string().uuid(),
  })

  const { userId } = deleteUserParamsSchema.parse(request.params)

  try {
    const userRepository = new PrismaUserRepository(prisma)
    const deleteUserUseCase = new DeleteUserUseCase(userRepository)

    const result = await deleteUserUseCase.execute({ userId })

    return reply.status(200).send(result)
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message })
    }

    throw error
  }
}

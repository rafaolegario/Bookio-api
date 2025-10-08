import { z } from 'zod'
import { FastifyReply, FastifyRequest } from 'fastify'
import { InvalidCredentialsError } from '@/use-cases/errors/invalid-credentials-error'
import { PrismaUserRepository } from '@/repositories/prisma/prisma-user-repository'
import { PrismaClient } from '@prisma/client'
import { AuthenticateUseCase } from '@/use-cases/account/authenticate'

export async function AuthenticateController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authenticateBodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const { email, password } = authenticateBodySchema.parse(request.body)

  try {
    const prisma = new PrismaClient()
    const userRepository = new PrismaUserRepository(prisma)
    const authenticateUseCase = new AuthenticateUseCase(userRepository)

    const { user } = await authenticateUseCase.execute({ email, password })

    const token = await reply.jwtSign(
      {
        role: user.getRole(),
      },
      {
        sign: {
          sub: user.getId().toString(),
        },
      },
    )

    const refreshToken = await reply.jwtSign(
      {
        role: user.getRole(),
      },
      {
        sign: {
          sub: user.getId().toString(),
          expiresIn: '7d',
        },
      },
    )

    return reply
      .setCookie('refreshToken', refreshToken, {
        path: '/',
        secure: true,
        sameSite: true,
        httpOnly: true,
      })
      .status(200)
      .send({
        token,
      })
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return reply.status(401).send({ message: error.message })
    }

    throw error
  }
}

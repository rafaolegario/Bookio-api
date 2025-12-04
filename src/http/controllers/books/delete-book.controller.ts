import { FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '@/lib/prisma'
import { PrismaBookRepository } from '@/repositories/prisma/prisma-book-repository'
import { DeleteBookUseCase } from '@/use-cases/library/book/delete-book-use-case'

export async function DeleteBookController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { bookId } = request.params as { bookId: string }

  const bookRepository = new PrismaBookRepository(prisma)
  const deleteBookUseCase = new DeleteBookUseCase(bookRepository)

  await deleteBookUseCase.execute({ bookId })

  return reply.status(204).send()
}

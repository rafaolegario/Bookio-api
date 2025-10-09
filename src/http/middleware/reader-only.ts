import { FastifyReply, FastifyRequest } from "fastify";
import { Roles } from "../../entities/User";

export async function readerOnlyMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify();

    const user = request.user as { role: Roles };

    if (user.role !== Roles.READER) {
      return reply.status(403).send({
        error: "Forbidden",
        message: "Acesso permitido apenas para leitores"
      });
    }
  } catch (error) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "Token inválido ou ausente"
    });
  }
}

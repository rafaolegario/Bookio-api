import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { authMiddleware } from "../../middleware/auth";
import { readerOnlyMiddleware } from "../../middleware/reader-only";
import { CreateSchedulingController } from "./create-scheduling.controller";
import { GetSchedulingByIdController } from "./get-scheduling-by-id.controller";
import { ListSchedulingsByReaderController } from "./list-schedulings-by-reader.controller";
import { DeleteSchedulingController } from "./delete-scheduling.controller";

export async function schedulingsRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/schedulings",
      {
        onRequest: [readerOnlyMiddleware],
        schema: {
          tags: ["Agendamentos"],
          summary: "Criar agendamento",
          body: z.object({
            readerId: z.string().uuid(),
            bookId: z.string().transform(Number),
          }),
          response: {
            201: z.object({
              scheduling: z.object({
                id: z.string(),
                status: z.string(),
                expiresAt: z.date(),
              }),
            }),
          },
        },
      },
      CreateSchedulingController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/schedulings/:schedulingId",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Agendamentos"],
          summary: "Buscar agendamento por ID",
          params: z.object({ schedulingId: z.string().uuid() }),
          response: {
            200: z.object({
              scheduling: z.object({
                id: z.string(),
                readerId: z.string(),
                bookId: z.number(),
                status: z.string(),
                expiresAt: z.date(),
              }),
            }),
          },
        },
      },
      GetSchedulingByIdController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/readers/:readerId/schedulings",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Agendamentos"],
          summary: "Listar agendamentos de um leitor",
          params: z.object({ readerId: z.string().uuid() }),
          response: {
            200: z.object({
              schedulings: z.array(
                z.object({
                  id: z.string(),
                  bookId: z.number(),
                  status: z.string(),
                  expiresAt: z.date(),
                }),
              ),
            }),
          },
        },
      },
      ListSchedulingsByReaderController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/schedulings/:schedulingId",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Agendamentos"],
          summary: "Cancelar agendamento",
          params: z.object({ schedulingId: z.string().uuid() }),
          response: { 204: z.null() },
        },
      },
      DeleteSchedulingController,
    );
}

import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { libraryOnlyMiddleware } from "../../middleware/library-only";
import { authMiddleware } from "../../middleware/auth";
import { CreatePenalityController } from "./create-penality.controller";
import { GetPenalityByIdController } from "./get-penality-by-id.controller";
import { GetPenalitiesByReaderIdController } from "./get-penalities-by-reader-id.controller";
import { GetPenalitiesByLibraryIdController } from "./get-penalities-by-library-id.controller";
import { PayPenalityController } from "./pay-penality.controller";

export async function penaltiesRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/penalties",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Multas"],
          summary: "Criar multa",
          body: z.object({
            readerId: z.string().uuid(),
            loanId: z.string().uuid(),
            amount: z.number().positive(),
            dueDate: z.string().transform((val) => new Date(val)),
          }),
          response: {
            201: z.object({
              penality: z.object({
                id: z.string(),
                amount: z.number(),
                paid: z.boolean(),
              }),
            }),
          },
        },
      },
      CreatePenalityController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/penalties/:penalityId",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Multas"],
          summary: "Buscar multa por ID",
          params: z.object({ penalityId: z.string().uuid() }),
          response: {
            200: z.object({
              penality: z.object({
                id: z.string(),
                loanId: z.string(),
                amount: z.number(),
                paid: z.boolean(),
                createdAt: z.date(),
              }),
            }),
          },
        },
      },
      GetPenalityByIdController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/readers/:readerId/penalties",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Multas"],
          summary: "Listar multas de um leitor",
          params: z.object({ readerId: z.string().uuid() }),
          response: {
            200: z.object({
              penalities: z.array(
                z.object({
                  id: z.string(),
                  amount: z.number(),
                  paid: z.boolean(),
                }),
              ),
            }),
          },
        },
      },
      GetPenalitiesByReaderIdController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/libraries/:libraryId/penalties",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Multas"],
          summary: "Listar multas de uma biblioteca",
          params: z.object({ libraryId: z.string().uuid() }),
          response: {
            200: z.object({
              penalities: z.array(
                z.object({
                  id: z.string(),
                  readerId: z.string(),
                  loanId: z.string(),
                  amount: z.number(),
                  paid: z.boolean(),
                  dueDate: z.date(),
                  createdAt: z.date(),
                  updatedAt: z.date().optional(),
                }),
              ),
            }),
          },
        },
      },
      GetPenalitiesByLibraryIdController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .patch(
      "/penalties/:penalityId/pay",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Multas"],
          summary: "Pagar multa",
          params: z.object({ penalityId: z.string().uuid() }),
          response: {
            200: z.object({
              penality: z.object({ id: z.string(), paid: z.boolean() }),
            }),
          },
        },
      },
      PayPenalityController,
    );
}

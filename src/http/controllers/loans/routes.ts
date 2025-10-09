import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { libraryOnlyMiddleware } from "../../middleware/library-only";
import { authMiddleware } from "../../middleware/auth";
import { CreateLoanController } from "./create-loan.controller";
import { GetLoanByIdController } from "./get-loan-by-id.controller";
import { ListLoansController } from "./list-loans.controller";
import { ListLoansByReaderController } from "./list-loans-by-reader.controller";
import { VerifyLoanStatusController } from "./verify-loan-status.controller";
import { DeleteLoanController } from "./delete-loan.controller";

export async function loansRoutes(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/loans",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Criar empréstimo",
          body: z.object({
            bookId: z.string(),
            readerId: z.string().uuid(),
            returnDate: z.string().transform((val) => new Date(val)),
          }),
          response: {
            201: z.object({
              loan: z.object({ id: z.string(), status: z.string() }),
            }),
          },
        },
      },
      CreateLoanController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/loans/:loanId",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Buscar empréstimo por ID",
          params: z.object({ loanId: z.string().uuid() }),
          response: {
            200: z.object({
              loan: z.object({
                id: z.string(),
                bookId: z.string(),
                readerId: z.string(),
                returnDate: z.date(),
                dueDate: z.date(),
                status: z.string(),
              }),
            }),
          },
        },
      },
      GetLoanByIdController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/loans",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Listar todos os empréstimos",
          response: {
            200: z.object({
              loans: z.array(z.object({ id: z.string(), status: z.string() })),
            }),
          },
        },
      },
      ListLoansController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/readers/:readerId/loans",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Listar empréstimos de um leitor",
          params: z.object({ readerId: z.string().uuid() }),
          response: {
            200: z.object({
              loans: z.array(z.object({ id: z.string(), status: z.string() })),
            }),
          },
        },
      },
      ListLoansByReaderController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/loans/:loanId/status",
      {
        onRequest: [authMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Verificar status do empréstimo",
          params: z.object({ loanId: z.string().uuid() }),
          response: {
            200: z.object({
              loan: z.object({ id: z.string(), status: z.string() }),
              isOverdue: z.boolean(),
              daysOverdue: z.number(),
            }),
          },
        },
      },
      VerifyLoanStatusController,
    );
  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/loans/:loanId",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Deletar empréstimo",
          params: z.object({ loanId: z.string().uuid() }),
          response: { 204: z.null() },
        },
      },
      DeleteLoanController,
    );
}

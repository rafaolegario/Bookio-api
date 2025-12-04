import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { libraryOnlyMiddleware } from "../../middleware/library-only";
import { authMiddleware } from "../../middleware/auth";
import { CreateLoanController } from "./create-loan.controller";
import { GetLoanByIdController } from "./get-loan-by-id.controller";
import { ListLoansController } from "./list-loans.controller";
import { ListLoansByReaderController } from "./list-loans-by-reader.controller";
import { GetLoansByLibraryIdController } from "./get-loans-by-library-id.controller";
import { VerifyLoanStatusController } from "./verify-loan-status.controller";
import { UpdateLoanStatusController } from "./update-loan-status.controller";
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
          description: "Cria um novo empréstimo. A data de devolução (returnDate) é obrigatória e define o prazo final para entrega.",
          body: z.object({
            bookId: z.string().describe("ID do livro"),
            readerId: z.string().uuid().describe("ID do leitor"),
            returnDate: z.string().transform((val) => new Date(val)).describe("Data limite para devolução (ISO 8601)"),
          }),
          response: {
            201: z.object({
              loan: z.object({ 
                id: z.string(), 
                status: z.string() 
              }),
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
                returnDate: z.date().describe("Data limite para devolução"),
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
      "/libraries/:libraryId/loans",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Listar empréstimos de uma biblioteca",
          params: z.object({ libraryId: z.string().uuid() }),
          response: {
            200: z.object({
              loans: z.array(
                z.object({
                  id: z.string(),
                  bookId: z.string(),
                  readerId: z.string(),
                  returnDate: z.date().describe("Data limite para devolução"),
                  status: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date().optional(),
                }),
              ),
            }),
          },
        },
      },
      GetLoansByLibraryIdController,
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
    .patch(
      "/loans/:loanId/status",
      {
        onRequest: [libraryOnlyMiddleware],
        schema: {
          tags: ["Empréstimos"],
          summary: "Atualizar status do empréstimo",
          description: "Atualiza o status do empréstimo. Use 'Returned' para devolução, 'Overdue' para atraso ou 'Borrowed' para em andamento.",
          params: z.object({ loanId: z.string().uuid() }),
          body: z.object({
            status: z.enum(['Returned', 'Overdue', 'Borrowed']).describe("Novo status do empréstimo"),
          }),
          response: {
            200: z.object({
              loan: z.object({ id: z.string(), status: z.string() }),
            }),
          },
        },
      },
      UpdateLoanStatusController,
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

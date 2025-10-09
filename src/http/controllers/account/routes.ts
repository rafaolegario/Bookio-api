import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { AuthenticateController } from './authenticate.controller'
import { CreateLibraryController } from './create-library.controller'
import { GetLibraryController } from './get-library.controller'
import { UpdateLibraryController } from './update-library.controller'
import { CreateReaderController } from './create-reader.controller'
import { GetReaderController } from './get-reader.controller'
import { GetReadersByLibraryController } from './get-readers-by-library.controller'
import { UpdateReaderController } from './update-reader.controller'
import { DeleteUserController } from './delete-user.controller'
import { libraryOnlyMiddleware } from '../../middleware/library-only'
import { authMiddleware } from '../../middleware/auth'

export async function accountRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/authenticate',
    {
      schema: {
        tags: ['Autenticação'],
        summary: 'Autenticar usuário',
        description: 'Realiza login e retorna token JWT',
        body: z.object({
          email: z.string().email(),
          password: z.string().min(6),
        }),
        response: {
          200: z.object({
            token: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
        },
      },
    },
    AuthenticateController,
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/library',
    {
      schema: {
        tags: ['Biblioteca'],
        summary: 'Criar nova biblioteca',
        description: 'Cadastra uma nova biblioteca no sistema',
        body: z.object({
          name: z.string(),
          email: z.string().email(),
          password: z.string().min(6),
          cnpj: z.string(),
          address: z.object({
            cep: z.string(),
            street: z.string(),
            neighborhood: z.string(),
            city: z.string(),
            number: z.string(),
          }),
        }),
        response: {
          201: z.null(),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    CreateLibraryController,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/library/:libraryId',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Biblioteca'],
        summary: 'Buscar biblioteca por ID',
        description: 'Retorna os dados de uma biblioteca específica',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            library: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cnpj: z.string(),
              address: z.object({
                cep: z.string(),
                street: z.string(),
                neighborhood: z.string(),
                city: z.string(),
                number: z.string(),
              }),
              role: z.string(),
              createdAt: z.date(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    GetLibraryController,
  )

  app.withTypeProvider<ZodTypeProvider>().put(
    '/library/:libraryId',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Biblioteca'],
        summary: 'Atualizar biblioteca',
        description: 'Atualiza os dados de uma biblioteca existente',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        body: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          cnpj: z.string().optional(),
          address: z
            .object({
              cep: z.string().optional(),
              street: z.string().optional(),
              neighborhood: z.string().optional(),
              city: z.string().optional(),
              number: z.string().optional(),
            })
            .optional(),
        }),
        response: {
          200: z.object({
            library: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cnpj: z.string(),
              address: z.object({
                cep: z.string(),
                street: z.string(),
                neighborhood: z.string(),
                city: z.string(),
                number: z.string(),
              }),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    UpdateLibraryController,
  )

  app.post(
    '/reader',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Leitor'],
        summary: 'Criar novo leitor',
        description:
          'Envie multipart/form-data com: 1) campo "data" contendo JSON com {name, email, libraryId, cpf, address: {cep, street, neighborhood, city, number}} e 2) campo opcional "picture" com a imagem de perfil. Uma senha aleatória será gerada e enviada por email.',
        consumes: ['multipart/form-data'],
        response: {
          201: z.null(),
          400: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    CreateReaderController,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/reader/:readerId',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Leitor'],
        summary: 'Buscar leitor por ID',
        description: 'Retorna os dados de um leitor específico',
        params: z.object({
          readerId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            reader: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cpf: z.string(),
              pictureUrl: z.string().optional(),
              active: z.boolean(),
              suspense: z.number(),
              libraryId: z.string(),
              address: z.object({
                cep: z.string(),
                street: z.string(),
                neighborhood: z.string(),
                city: z.string(),
                number: z.string(),
              }),
              role: z.string(),
              createdAt: z.date(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    GetReaderController,
  )

  app.withTypeProvider<ZodTypeProvider>().get(
    '/library/:libraryId/readers',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Leitor'],
        summary: 'Listar leitores de uma biblioteca',
        description: 'Retorna todos os leitores cadastrados em uma biblioteca',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            readers: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
                cpf: z.string(),
                pictureUrl: z.string().optional(),
                active: z.boolean(),
                suspense: z.number(),
                address: z.object({
                  cep: z.string(),
                  street: z.string(),
                  neighborhood: z.string(),
                  city: z.string(),
                  number: z.string(),
                }),
                createdAt: z.date(),
              }),
            ),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    GetReadersByLibraryController,
  )

  app.put(
    '/reader/:readerId',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Leitor'],
        summary: 'Atualizar leitor',
        description:
          'Envie multipart/form-data com: 1) campo opcional "data" contendo JSON com qualquer um dos campos {name, email, cpf, address: {cep, street, neighborhood, city, number}} e 2) campo opcional "picture" para atualizar a imagem de perfil',
        consumes: ['multipart/form-data'],
        params: z.object({
          readerId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            reader: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
              cpf: z.string(),
              pictureUrl: z.string().optional(),
              active: z.boolean(),
              suspense: z.number(),
              address: z.object({
                cep: z.string(),
                street: z.string(),
                neighborhood: z.string(),
                city: z.string(),
                number: z.string(),
              }),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    UpdateReaderController,
  )

  app.withTypeProvider<ZodTypeProvider>().delete(
    '/user/:userId',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Usuário'],
        summary: 'Deletar usuário',
        description: 'Remove um usuário (biblioteca ou leitor) do sistema',
        params: z.object({
          userId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    DeleteUserController,
  )

}

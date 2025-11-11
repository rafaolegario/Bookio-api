import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { libraryOnlyMiddleware } from '../../middleware/library-only'
import { authMiddleware } from '../../middleware/auth'
import { CreateBookController } from './create-book.controller'
import { GetBookByIdController } from './get-book-by-id.controller'
import { GetBooksByLibraryIdController } from './get-books-by-library-id.controller'
import { GetBookByTitleController } from './get-book-by-title.controller'
import { GetBooksByGenderController } from './get-books-by-gender.controller'
import { GetMostBorrowedBooksController } from './get-most-borrowed-books.controller'
import { UpdateBookController } from './update-book.controller'
import { DeleteBookController } from './delete-book.controller'

export async function booksRoutes(app: FastifyInstance) {
  // Create Book
  app.post(
    '/books',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Criar novo livro',
        description:
          'Envie multipart/form-data com:\n' +
          '1) Campo "data" (obrigatório) contendo JSON com:\n' +
          '   - libraryId (string UUID)\n' +
          '   - author (string)\n' +
          '   - title (string)\n' +
          '   - gender (enum: Fiction, NonFiction, Fantasy, ScienceFiction, Mystery, Romance, Thriller, Horror, Biography, History, Poetry, SelfHelp)\n' +
          '   - year (string formato: "YYYY-MM-DD")\n' +
          '   - available (number inteiro positivo)\n' +
          '2) Campo "image" (opcional) com arquivo de imagem (JPEG, PNG, WEBP, máx 5MB)',
        consumes: ['multipart/form-data'],
        response: {
          201: z.object({
            book: z.object({
              id: z.number(),
              title: z.string(),
              author: z.string(),
            }),
          }),
        },
      },
    },
    CreateBookController,
  )

  // Get Book by ID
  app.withTypeProvider<ZodTypeProvider>().get(
    '/books/:bookId',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Buscar livro por ID',
        params: z.object({
          bookId: z.string(),
        }),
        response: {
          200: z.object({
            book: z.object({
              id: z.number(),
              title: z.string(),
              author: z.string(),
              gender: z.string(),
              year: z.string(),
              available: z.number(),
              imageUrl: z.string().optional(),
            }),
          }),
        },
      },
    },
    GetBookByIdController,
  )

  // Get All Books by Library
  app.withTypeProvider<ZodTypeProvider>().get(
    '/libraries/:libraryId/books',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Listar livros de uma biblioteca',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            books: z.array(
              z.object({
                id: z.number(),
                title: z.string(),
                author: z.string(),
                available: z.number(),
              }),
            ),
          }),
        },
      },
    },
    GetBooksByLibraryIdController,
  )

  // Get Book by Title
  app.withTypeProvider<ZodTypeProvider>().get(
    '/libraries/:libraryId/books/search',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Buscar livro por título',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        querystring: z.object({
          title: z.string(),
        }),
        response: {
          200: z.object({
            book: z.object({
              id: z.number(),
              title: z.string(),
              author: z.string(),
              gender: z.string(),
              year: z.string(),
              available: z.number(),
              imageUrl: z.string().optional(),
            }),
          }),
        },
      },
    },
    GetBookByTitleController,
  )

  // Get Books by Gender
  app.withTypeProvider<ZodTypeProvider>().get(
    '/books/gender/:gender',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Buscar livros por gênero',
        params: z.object({
          gender: z.enum([
            'Fiction',
            'NonFiction',
            'Fantasy',
            'ScienceFiction',
            'Mystery',
            'Romance',
            'Thriller',
            'Horror',
            'Biography',
            'History',
            'Poetry',
            'SelfHelp',
          ]),
        }),
        response: {
          200: z.object({
            books: z.array(
              z.object({
                id: z.number(),
                title: z.string(),
                author: z.string(),
                available: z.number(),
              }),
            ),
          }),
        },
      },
    },
    GetBooksByGenderController,
  )

  // Get Most Borrowed Books
  app.withTypeProvider<ZodTypeProvider>().get(
    '/libraries/:libraryId/books/most-borrowed',
    {
      onRequest: [authMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Listar os 5 livros mais emprestados',
        params: z.object({
          libraryId: z.string().uuid(),
        }),
        response: {
          200: z.object({
            books: z.array(
              z.object({
                bookId: z.string(),
                title: z.string(),
                author: z.string(),
                totalLoans: z.number(),
              }),
            ),
          }),
        },
      },
    },
    GetMostBorrowedBooksController,
  )

  // Update Book
  app.put(
    '/books/:bookId',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Atualizar livro',
        description:
          'Envie multipart/form-data com:\n' +
          '1) Campo "data" (obrigatório) contendo JSON com campos opcionais:\n' +
          '   - title (string)\n' +
          '   - author (string)\n' +
          '   - gender (enum: Fiction, NonFiction, Fantasy, ScienceFiction, Mystery, Romance, Thriller, Horror, Biography, History, Poetry, SelfHelp)\n' +
          '   - year (string formato: "YYYY-MM-DD")\n' +
          '   - available (number inteiro positivo)\n' +
          '2) Campo "image" (opcional) com arquivo de imagem (JPEG, PNG, WEBP, máx 5MB)',
        consumes: ['multipart/form-data'],
      },
    },
    UpdateBookController,
  )

  // Delete Book
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/books/:bookId',
    {
      onRequest: [libraryOnlyMiddleware],
      schema: {
        tags: ['Livros'],
        summary: 'Deletar livro',
        params: z.object({
          bookId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    DeleteBookController,
  )
}

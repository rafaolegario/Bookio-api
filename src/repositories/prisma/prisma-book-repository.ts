import { PrismaClient } from '@prisma/client'
import { BookRepository } from '../book-repository'
import { Book, BookGenders } from '@/entities/Book'
import { UniqueEntityId } from '@/entities/UniqueEntityId'

export class PrismaBookRepository implements BookRepository {
  constructor(private prisma: PrismaClient) { }

  async findByTitle(title: string, libraryId: string): Promise<Book | null> {
    const book = await this.prisma.book.findFirst({
      where: {
        title,
        libraryId,
      },
    })

    if (!book) return null

    const newBook = new Book({
      libraryId: new UniqueEntityId(book.libraryId),
      author: book.author,
      title: book.title,
      imageUrl: book.imageUrl ?? undefined,
      gender: book.gender as BookGenders,
      year: book.year,
      available: book.available,
      total_loans: book.totalLoans,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    })

    newBook.setId(book.id)
    return newBook
  }

  async findById(bookId: string): Promise<Book | null> {
    const book = await this.prisma.book.findUnique({
      where: { id: Number(bookId) },
    })

    if (!book) return null

    const newBook = new Book({
      libraryId: new UniqueEntityId(book.libraryId),
      author: book.author,
      title: book.title,
      imageUrl: book.imageUrl ?? undefined,
      gender: book.gender as BookGenders,
      year: book.year,
      available: book.available,
      total_loans: book.totalLoans,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    })

    newBook.setId(book.id)
    return newBook
  }

  async findByLibraryId(libraryId: string): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { libraryId },
    })

    return books.map((book) => {
      const newBook = new Book({
        libraryId: new UniqueEntityId(book.libraryId),
        author: book.author,
        title: book.title,
        imageUrl: book.imageUrl ?? undefined,
        gender: book.gender as BookGenders,
        year: book.year,
        available: book.available,
        total_loans: book.totalLoans,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })
      newBook.setId(book.id)
      return newBook
    })
  }

  async findByGender(gender: BookGenders): Promise<Book[]> {
    const books = await this.prisma.book.findMany({
      where: { gender },
    })

    return books.map((book) => {
      const newBook = new Book({
        libraryId: new UniqueEntityId(book.libraryId),
        author: book.author,
        title: book.title,
        imageUrl: book.imageUrl ?? undefined,
        gender: book.gender as BookGenders,
        year: book.year,
        available: book.available,
        total_loans: book.totalLoans,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
      })
      newBook.setId(book.id)
      return newBook
    })
  }

  async create(book: Book): Promise<Book> {
    const createdBook = await this.prisma.book.create({
      data: {
        libraryId: book.getLibraryId().toString(),
        author: book.getAuthor(),
        title: book.getTitle(),
        imageUrl: book.getImageUrl(),
        gender: book.getGender(),
        year: book.getYear(),
        available: book.getAvailable(),
        totalLoans: book.getTotalLoans(),
        createdAt: book.getCreatedAt(),
        updatedAt: book.getUpdatedAt(),
      },
    })

    const newBook = new Book({
      libraryId: new UniqueEntityId(createdBook.libraryId),
      author: createdBook.author,
      title: createdBook.title,
      imageUrl: createdBook.imageUrl ?? undefined,
      gender: createdBook.gender as BookGenders,
      year: createdBook.year,
      available: createdBook.available,
      total_loans: createdBook.totalLoans,
      createdAt: createdBook.createdAt,
      updatedAt: createdBook.updatedAt,
    })

    newBook.setId(createdBook.id)
    return newBook
  }

  async delete(bookId: string): Promise<void> {
    await this.prisma.book.delete({
      where: { id: Number(bookId) },
    })
  }

  async save(book: Book): Promise<void> {
    const id = book.getId()
    if (!id) {
      throw new Error('Book ID is required for update')
    }

    await this.prisma.book.update({
      where: { id },
      data: {
        libraryId: book.getLibraryId().toString(),
        author: book.getAuthor(),
        title: book.getTitle(),
        imageUrl: book.getImageUrl(),
        gender: book.getGender(),
        year: book.getYear(),
        available: book.getAvailable(),
        totalLoans: book.getTotalLoans(),
        updatedAt: book.getUpdatedAt(),
      },
    })
  }
}

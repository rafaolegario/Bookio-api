import { Book, BookGenders } from "@/entities/Book";

export abstract class BookRepository {
  abstract findByTitle(title: string, libraryId: string): Promise<Book | null>
  abstract findById(bookId: string): Promise<Book | null>
  abstract findByLibraryId(libraryId: string): Promise<Book[]>
  abstract findByGender(gender: BookGenders): Promise<Book[]>;
  abstract create(book: Book): Promise<void>
  abstract delete(bookId: string): Promise<void>
  abstract save(book: Book): Promise<void>
}
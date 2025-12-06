import { Book, BookGenders } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { UniqueEntityId } from "@/entities/UniqueEntityId";

interface CreateBookRequest {
  author: string;
  libraryId: string;
  title: string;
  imageUrl: string;
  gender: BookGenders;
  year: Date;
  available: number;
}

export class CreateBookUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({
    author,
    libraryId,
    title,
    imageUrl,
    gender,
    year,
    available,
  }: CreateBookRequest) {
    const existingBook = await this.bookRepository.findByTitle(
      title,
      libraryId
    );

    if (existingBook) {
      throw new NotAllowedError('Já existe um livro com este título na biblioteca');
    }

    const book = new Book({
      libraryId: new UniqueEntityId(libraryId),
      author,
      title,
      imageUrl,
      gender,
      year,
      available,
      total_loans: 0,
    });

    const bookCreated = await this.bookRepository.create(book);

    return bookCreated;
  }
}

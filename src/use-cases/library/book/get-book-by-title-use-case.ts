import { Book } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface GetBookByTitleRequest {
  title: string;
  libraryId: string
}

interface GetBookByTitleResponse {
  book: Book;
}

export class GetBookByTitleUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({ title, libraryId }: GetBookByTitleRequest): Promise<GetBookByTitleResponse> {
    const book = await this.bookRepository.findByTitle(title, libraryId);

    if (!book) {
      throw new NotFoundError()
    }

    return { book };
  }
}

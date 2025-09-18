import { Book } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface GetBookByIdRequest {
  bookId: string;
}

interface GetBookByIdResponse {
  book: Book | NotFoundError;
}

export class GetBookByIdUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({ bookId }: GetBookByIdRequest): Promise<GetBookByIdResponse> {
    const book = await this.bookRepository.findById(bookId);

    if (!book) {
      throw new NotFoundError()
    }

    return { book };
  }
}

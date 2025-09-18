import { Book } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";

interface GetBooksByLibraryIdRequest {
  libraryId: string;
}

interface GetBooksByLibraryIdResponse {
  books: Book[];
}

export class GetBooksByLibraryIdUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({ libraryId }: GetBooksByLibraryIdRequest): Promise<GetBooksByLibraryIdResponse> {
    const books = await this.bookRepository.findByLibraryId(libraryId);

    return { books };
  }
}

import { Book, BookGenders } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";

interface GetBooksByGenderRequest {
  gender: BookGenders;
}

interface GetBooksByGenderResponse {
  books: Book[];
}

export class GetBooksByGenderUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({ gender }: GetBooksByGenderRequest): Promise<GetBooksByGenderResponse> {
    const books = await this.bookRepository.findByGender(gender);

    return { books };
  }
}

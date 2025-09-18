import { BookRepository } from "@/repositories/book-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";

interface DeleteBookRequest {
  bookId: string;
}

export class DeleteBookUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({ bookId }: DeleteBookRequest): Promise<void> {
    const book = await this.bookRepository.findById(bookId);

    if (!book) {
      throw new NotAllowedError();
    }

    await this.bookRepository.delete(bookId);
  }
}

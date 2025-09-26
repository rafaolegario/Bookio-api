import { Book, BookGenders } from "@/entities/Book";
import { BookRepository } from "@/repositories/book-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";

interface UpdateBookRequest {
  bookId: string;
  title?: string;
  author?: string;
  imageUrl?: string;
  gender?: BookGenders;
  year?: Date;
  available?: number;
  total_loans?: number;
}

interface UpdateBookResponse {
  book: Book;
}

export class UpdateBookUseCase {
  constructor(private bookRepository: BookRepository) { }

  async execute({
    bookId,
    title,
    author,
    imageUrl,
    gender,
    year,
    available,
    total_loans,
  }: UpdateBookRequest): Promise<UpdateBookResponse> {
    const book = await this.bookRepository.findById(bookId);

    if (!book) {
      throw new NotAllowedError('Livro não encontrado');
    }

    if (title) book.setTitle(title);
    if (author) book.setAuthor(author);
    if (imageUrl) book.setImageUrl(imageUrl);
    if (gender) book.setGender(gender);
    if (year) book.setYear(year);
    if (available !== undefined) book.setAvailable(available);
    if (total_loans !== undefined) book.setTotalLoans(total_loans);

    await this.bookRepository.save(book);

    return { book };
  }
}

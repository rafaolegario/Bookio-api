import { Loan, LoanStatus } from "@/entities/Loan";
import { BookRepository } from "@/repositories/book-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { UniqueEntityId } from "@/entities/UniqueEntityId";
import { LoanRepository } from "@/repositories/loan-repository";

interface CreateLoanRequest {
  bookId: string;
  readerId: string;
  returnDate: Date;
}

export class CreateLoanUseCase {
  constructor(
    private loanRepository: LoanRepository,
    private bookRepository: BookRepository
  ) { }

  async execute({ bookId, readerId, returnDate }: CreateLoanRequest) {
    const book = await this.bookRepository.findById(bookId);
    if (!book) {
      throw new NotAllowedError();
    }

    if (book.getAvailable() <= 0) {
      throw new NotAllowedError();
    }

    const loan = new Loan({
      bookId: new UniqueEntityId(bookId),
      readerId: new UniqueEntityId(readerId),
      returnDate,
      status: LoanStatus.Borrowed,
    });

    book.setAvailable(book.getAvailable() - 1);

    await this.loanRepository.create(loan);
    await this.bookRepository.save(book);

    return loan;
  }
}

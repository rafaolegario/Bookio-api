import { BookRepository } from '../../../repositories/book-repository'
import { LoanRepository } from '../../../repositories/loan-repository'

interface GetMostBorrowedBooksUseCaseRequest {
  libraryId: string
}

interface BookWithLoanCount {
  bookId: string
  title: string
  author: string
  totalLoans: number
}

export class GetMostBorrowedBooksUseCase {
  constructor(
    private bookRepository: BookRepository,
    private loanRepository: LoanRepository,
  ) { }

  async execute({ libraryId }: GetMostBorrowedBooksUseCaseRequest) {
    const TOP_BOOKS_LIMIT = 5
    // 1. Buscar todos os empréstimos da biblioteca
    const loans = await this.loanRepository.findByLibraryId(libraryId)

    // 2. Contar empréstimos por livro
    const bookLoanCount = new Map<string, number>()
    loans.forEach(loan => {
      const bookId = loan.getBookId.toString()
      bookLoanCount.set(bookId, (bookLoanCount.get(bookId) || 0) + 1)
    })

    // 3. Converter para array e ordenar por número de empréstimos
    const sortedBookIds = Array.from(bookLoanCount.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar do maior para o menor
      .slice(0, TOP_BOOKS_LIMIT) // Limitar aos 5 livros mais emprestados
      .map(([bookId]) => bookId)

    // 4. Buscar detalhes dos livros mais emprestados
    const mostBorrowedBooks: BookWithLoanCount[] = []
    for (const bookId of sortedBookIds) {
      const book = await this.bookRepository.findById(bookId)
      if (book && book.getLibraryId().toString() === libraryId) {
        mostBorrowedBooks.push({
          bookId: bookId,
          title: book.getTitle(),
          author: book.getAuthor(),
          totalLoans: bookLoanCount.get(bookId) || 0,
        })
      }
    }

    return {
      books: mostBorrowedBooks,
    }
  }
}
import { PenalityRepository } from '../../../repositories/penality-repository'
import { ReaderRepository } from '../../../repositories/reader-repository'
import { LoanRepository } from '../../../repositories/loan-repository'
import { BookRepository } from '../../../repositories/book-repository'
import { Penality } from '../../../entities/Penality'

interface CreatePenalityUseCaseRequest {
  readerId: string
  loanId: string
  amount: number
  dueDate: Date
}

type CreatePenalityUseCaseResponse = {
  penality: Penality
}

export class CreatePenalityUseCase {
  constructor(
    private penalityRepository: PenalityRepository,
    private readerRepository: ReaderRepository,
    private loanRepository: LoanRepository,
    private bookRepository: BookRepository
  ) { }

  async execute({
    readerId,
    loanId,
    amount,
    dueDate,
  }: CreatePenalityUseCaseRequest): Promise<CreatePenalityUseCaseResponse> {
    // Buscar dados do leitor, empréstimo e livro para o email
    const reader = await this.readerRepository.findById(readerId)
    if (!reader) {
      throw new Error('Leitor não encontrado')
    }

    const loan = await this.loanRepository.findById(loanId, reader.getLibraryId().toString())
    if (!loan) {
      throw new Error('Empréstimo não encontrado')
    }

    const book = await this.bookRepository.findById(loan.getBookId.toString())
    if (!book) {
      throw new Error('Livro não encontrado')
    }

    const penality = new Penality({
      readerId,
      loanId,
      amount,
      paid: false,
      dueDate,
      createdAt: new Date(),
    })

    await this.penalityRepository.create(penality)

    return {
      penality,
    }
  }
}

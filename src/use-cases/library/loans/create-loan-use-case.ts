import { Loan, LoanStatus } from '../../../entities/Loan'
import { BookRepository } from '../../../repositories/book-repository'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { UniqueEntityId } from '../../../entities/UniqueEntityId'
import { LoanRepository } from '../../../repositories/loan-repository'
import { PenalityRepository } from '../../../repositories/penality-repository'
import { SchedulingRepository } from '../../../repositories/scheduling-repository'
import { ReaderRepository } from '../../../repositories/reader-repository'
import { PendingPenalitiesError } from '../../errors/pending-penalities-error'
import { SchedulingStatus } from '../../../entities/Scheduling'

interface CreateLoanRequest {
  bookId: string
  readerId: string
  returnDate: Date
  dueDate?: Date
}

export class CreateLoanUseCase {
  constructor(
    private loanRepository: LoanRepository,
    private bookRepository: BookRepository,
    private penalityRepository: PenalityRepository,
    private schedulingRepository: SchedulingRepository,
    private readerRepository: ReaderRepository,
  ) { }

  async execute({ bookId, readerId, returnDate }: CreateLoanRequest) {
    // Check for pending penalties
    const penalities = await this.penalityRepository.findByReaderId(readerId)
    const hasPendingPenalties = penalities.some(penalty => !penalty.paid)

    if (hasPendingPenalties) {
      throw new PendingPenalitiesError()
    }

    // Check if reader is suspended
    const reader = await this.readerRepository.findById(readerId)
    if (!reader || reader.isSuspended()) {
      throw new NotAllowedError('Leitor suspenso ou não encontrado')
    }

    const book = await this.bookRepository.findById(bookId)
    if (!book) {
      throw new NotAllowedError('Livro não encontrado')
    }

    if (book.getAvailable() <= 0) {
      throw new NotAllowedError('Livro não está disponível para empréstimo')
    }

    // Verificar se existe um agendamento válido para este leitor e livro
    const scheduling = await this.schedulingRepository.findPendingByReaderAndBook(
      readerId,
      bookId,
    )

    // Se não houver agendamento, verificar se há agendamentos pendentes de outros leitores
    if (!scheduling) {
      const otherSchedulings = await this.schedulingRepository.findByBookId(bookId)
      const hasPendingScheduling = otherSchedulings.some(
        s => s.getStatus === SchedulingStatus.PENDING && !s.isExpired
      )

      if (hasPendingScheduling) {
        throw new Error('This book is scheduled for another reader')
      }
    } else {
      // Se houver agendamento do próprio leitor, marcar como concluído
      scheduling.setStatus = SchedulingStatus.COMPLETED
      await this.schedulingRepository.update(scheduling.getId, scheduling)
    }

    const loan = new Loan({
      bookId: new UniqueEntityId(bookId),
      readerId: new UniqueEntityId(readerId),
      returnDate,
      status: LoanStatus.Borrowed,
    })

    book.setAvailable(book.getAvailable() - 1)

    await this.loanRepository.create(loan)
    await this.bookRepository.save(book)

    return {
      loan,
    }
  }
}

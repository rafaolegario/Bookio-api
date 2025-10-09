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
import { MailProvider } from '../../../providers/mail-provider'

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
    private mailProvider: MailProvider,
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

    // Se dueDate não for fornecida, definir como 7 dias antes do returnDate
    const dueDate = new Date(returnDate.getTime() - 7 * 24 * 60 * 60 * 1000)

    const loan = new Loan({
      bookId: new UniqueEntityId(bookId),
      readerId: new UniqueEntityId(readerId),
      returnDate,
      dueDate,
      status: LoanStatus.Borrowed,
    })

    book.setAvailable(book.getAvailable() - 1)

    await this.loanRepository.create(loan)
    await this.bookRepository.save(book)

    // Formatar datas para exibição
    const formattedDueDate = dueDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
    const formattedReturnDate = returnDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // Enviar email de confirmação do empréstimo
    await this.mailProvider.sendMail({
      to: reader.getEmail(),
      subject: 'Empréstimo Confirmado - Bookio',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Empréstimo Confirmado! 📖</h1>

          <p style="font-size: 16px; color: #555;">
            Olá, <strong>${reader.getName()}</strong>!
          </p>

          <p style="font-size: 16px; color: #555;">
            Seu empréstimo foi registrado com sucesso. Confira os detalhes abaixo:
          </p>

          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #333; margin-top: 0;">Detalhes do Empréstimo:</h2>
            <p style="margin: 10px 0;"><strong>Livro:</strong> ${book.getTitle()}</p>
            <p style="margin: 10px 0;"><strong>Autor:</strong> ${book.getAuthor()}</p>
            <p style="margin: 10px 0;"><strong>Data de Devolução:</strong> ${formattedReturnDate}</p>
            <p style="margin: 10px 0;"><strong>Prazo Sugerido:</strong> ${formattedDueDate}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Atenção:</strong><br>
              Lembre-se de devolver o livro até <strong>${formattedReturnDate}</strong> para evitar multas.
            </p>
          </div>

          <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Boa leitura!<br>
            <strong>Equipe Bookio</strong>
          </p>
        </div>
      `
    })

    return {
      loan,
    }
  }
}

import { PenalityRepository } from '../../../repositories/penality-repository'
import { ReaderRepository } from '../../../repositories/reader-repository'
import { LoanRepository } from '../../../repositories/loan-repository'
import { BookRepository } from '../../../repositories/book-repository'
import { MailProvider } from '../../../providers/mail-provider'
import { Penality } from '../../../entities/Penality'
import { AbacatepayService } from '../../../services/payment/abacatepay-service'

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
    private bookRepository: BookRepository,
    private mailProvider: MailProvider
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

    // Criar cobrança no Abacatepay
    const abacatepayService = new AbacatepayService()
    let paymentLink: string | undefined

    try {
      const billing = await abacatepayService.createBilling({
        amount,
        description: `Multa - Atraso na devolução: ${book.getTitle()}`,
        customerId: readerId,
        customerName: reader.getName(),
        customerEmail: reader.getEmail(),
        dueDate,
      })
      paymentLink = billing.url
    } catch (error) {
      console.error('Error creating Abacatepay billing:', error)
      // Se falhar, continua sem link de pagamento
    }

    const penality = new Penality({
      readerId,
      loanId,
      amount,
      paid: false,
      dueDate,
      paymentLink,
      createdAt: new Date(),
    })

    await this.penalityRepository.create(penality)

    // Formatar valores para exibição
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)

    const formattedDueDate = dueDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })

    // Enviar email de notificação de multa
    await this.mailProvider.sendMail({
      to: reader.getEmail(),
      subject: 'Multa Gerada - Bookio',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d32f2f;">Multa Gerada ⚠️</h1>

          <p style="font-size: 16px; color: #555;">
            Olá, <strong>${reader.getName()}</strong>,
          </p>

          <p style="font-size: 16px; color: #555;">
            Uma multa foi gerada devido ao atraso na devolução do livro emprestado.
          </p>

          <div style="background-color: #ffebee; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d32f2f;">
            <h2 style="color: #d32f2f; margin-top: 0;">Detalhes da Multa:</h2>
            <p style="margin: 10px 0;"><strong>Livro:</strong> ${book.getTitle()}</p>
            <p style="margin: 10px 0;"><strong>Autor:</strong> ${book.getAuthor()}</p>
            <p style="margin: 10px 0;"><strong>Valor da Multa:</strong> <span style="color: #d32f2f; font-size: 18px; font-weight: bold;">${formattedAmount}</span></p>
            <p style="margin: 10px 0;"><strong>Vencimento:</strong> ${formattedDueDate}</p>
          </div>

          ${paymentLink ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}"
               style="background-color: #4caf50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
              💳 Pagar Multa
            </a>
          </div>
          ` : ''}

          <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⚠️ Importante:</strong><br>
              Enquanto houver multas pendentes, você não poderá realizar novos empréstimos.
              ${paymentLink ? 'Clique no botão acima para realizar o pagamento.' : 'Entre em contato com a biblioteca para realizar o pagamento.'}
            </p>
          </div>

          <p style="font-size: 14px; color: #555; margin-top: 30px;">
            Atenciosamente,<br>
            <strong>Equipe Bookio</strong>
          </p>
        </div>
      `
    })

    return {
      penality,
    }
  }
}

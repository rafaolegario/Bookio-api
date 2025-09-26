import { LoanRepository } from '../../../repositories/loan-repository'
import { PenalityRepository } from '../../../repositories/penality-repository'
import { Penality } from '../../../entities/Penality'

export class LoanMonitoringService {
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 15 * 60 * 1000 // 15 minutos
  private readonly PENALTY_AMOUNT = 10 // Valor da multa por atraso (pode ser configurável)

  constructor(
    private loanRepository: LoanRepository,
    private penalityRepository: PenalityRepository,
  ) { }

  start() {
    if (this.intervalId) {
      return
    }

    this.checkOverdueLoans()

    this.intervalId = setInterval(() => {
      this.checkOverdueLoans()
    }, this.CHECK_INTERVAL)
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  private async checkOverdueLoans() {
    try {
      const overdueLoans = await this.loanRepository.findOverdueLoans()

      for (const loan of overdueLoans) {
        // Verifica se já existe uma penalidade para este empréstimo
        const existingPenality = await this.penalityRepository.findByLoanId(loan.getId)

        if (!existingPenality) {
          // Cria uma nova penalidade se não existir
          const penality = new Penality({
            readerId: loan.getReaderId.toString(),
            loanId: loan.getId,
            amount: this.PENALTY_AMOUNT,
            paid: false,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias para pagar a multa
            createdAt: new Date(),
          })

          await this.penalityRepository.create(penality)
        }
      }
    } catch (error) {
      console.error('Error checking overdue loans:', error)
    }
  }
}
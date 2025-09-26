import { LoanRepository } from '../../../repositories/loan-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { LoanOverdueError } from '../../errors/loan-overdue-error'

interface VerifyLoanStatusUseCaseRequest {
  loanId: string
  libraryId: string
}

export class VerifyLoanStatusUseCase {
  constructor(private loanRepository: LoanRepository) { }

  async execute({ loanId, libraryId }: VerifyLoanStatusUseCaseRequest) {
    const loan = await this.loanRepository.findById(loanId, libraryId)

    if (!loan) {
      throw new NotFoundError()
    }

    const today = new Date()
    if (today > loan.getDueDate && !loan.getActualReturnDate) {
      throw new LoanOverdueError()
    }

    return {
      loan,
      isOverdue: today > loan.getDueDate && !loan.getActualReturnDate,
      daysOverdue: loan.getActualReturnDate
        ? Math.ceil((loan.getActualReturnDate.getTime() - loan.getDueDate.getTime()) / (1000 * 60 * 60 * 24))
        : Math.ceil((today.getTime() - loan.getDueDate.getTime()) / (1000 * 60 * 60 * 24)),
    }
  }
}
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
    const isOverdue = loan.getStatus === 'Borrowed' && today > loan.getReturnDate

    if (isOverdue) {
      // throw new LoanOverdueError() // Maybe we shouldn't throw here if we just want to return status
    }

    return {
      loan,
      isOverdue,
      daysOverdue: isOverdue
        ? Math.ceil((today.getTime() - loan.getReturnDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }
  }
}
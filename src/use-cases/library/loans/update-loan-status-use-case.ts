import { LoanRepository } from '@/repositories/loan-repository'
import { LoanStatus } from '@/entities/Loan'
import { NotFoundError } from '@/use-cases/errors/not-found-error'
import { NotAllowedError } from '@/use-cases/errors/not-allowed-error'

interface UpdateLoanStatusUseCaseRequest {
  loanId: string
  libraryId: string
  status: 'Returned' | 'Overdue' | 'Borrowed'
}

interface UpdateLoanStatusUseCaseResponse {
  loan: {
    id: string
    status: string
  }
}

export class UpdateLoanStatusUseCase {
  constructor(private loanRepository: LoanRepository) {}

  async execute({
    loanId,
    libraryId,
    status,
  }: UpdateLoanStatusUseCaseRequest): Promise<UpdateLoanStatusUseCaseResponse> {
    const loan = await this.loanRepository.findById(loanId, libraryId)

    if (!loan) {
      throw new NotFoundError()
    }

    // Verify if status is valid
    if (!Object.values(LoanStatus).includes(status as LoanStatus)) {
      throw new NotAllowedError('Invalid status')
    }

    loan.setStatus = status as LoanStatus

    if (status === LoanStatus.Returned) {
      loan.setActualReturnDate = new Date()
    }

    await this.loanRepository.save(loan)

    return {
      loan: {
        id: loan.getId,
        status: loan.getStatus,
      },
    }
  }
}

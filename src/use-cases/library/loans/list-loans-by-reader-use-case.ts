import { LoanRepository } from '../../../repositories/loan-repository'

interface ListLoansByReaderUseCaseRequest {
  readerId: string
}

export class ListLoansByReaderUseCase {
  constructor(private loanRepository: LoanRepository) { }

  async execute({ readerId }: ListLoansByReaderUseCaseRequest) {
    const loans = await this.loanRepository.findByReaderId(readerId)

    return {
      loans,
    }
  }
}
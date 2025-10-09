import { Loan } from '../../../entities/Loan'
import { LoanRepository } from '../../../repositories/loan-repository'

export class ListLoansUseCase {
  constructor(private loanRepository: LoanRepository) {}

  async execute(): Promise<Loan[]> {
    return await this.loanRepository.findOverdueLoans()
  }
}

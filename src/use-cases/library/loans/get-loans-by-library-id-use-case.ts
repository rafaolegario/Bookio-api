import { LoanRepository } from '@/repositories/loan-repository'

interface GetLoansByLibraryIdRequest {
  libraryId: string
}

export class GetLoansByLibraryIdUseCase {
  constructor(private loanRepository: LoanRepository) {}

  async execute({ libraryId }: GetLoansByLibraryIdRequest) {
    const loans = await this.loanRepository.findByLibraryId(libraryId)

    return {
      loans,
    }
  }
}

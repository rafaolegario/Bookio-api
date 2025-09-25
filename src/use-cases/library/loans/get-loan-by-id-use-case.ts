 
import { LoanRepository } from "@/repositories/loan-repository";
import { Loan } from "@/entities/Loan";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";

interface GetLoanByIdRequest {
  loanId: string;
  libraryId: string;
}

export class GetLoanByIdUseCase {
  constructor(private loanRepository: LoanRepository) {}

  async execute({ loanId, libraryId }: GetLoanByIdRequest): Promise<Loan> {
    const loan = await this.loanRepository.findById(loanId, libraryId);
    if (!loan) {
      throw new NotAllowedError();
    }
    return loan;
  }
}
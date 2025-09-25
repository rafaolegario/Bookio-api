import { LoanStatus } from "@/entities/Loan";
import { LoanRepository } from "@/repositories/loan-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface DeleteLoanRequest {
  loanId: string;
  libraryId: string;
}

export class DeleteLoanUseCase {
  constructor(private loanRepository: LoanRepository) {}

  async execute({ loanId, libraryId }: DeleteLoanRequest): Promise<void> {
    const loan = await this.loanRepository.findById(loanId, libraryId);
    if (!loan) {
      throw new NotFoundError();
    }

    if(loan.getStatus() !== LoanStatus.Returned ) {
      throw new NotAllowedError();
    }
    await this.loanRepository.delete(loanId);
  }
}
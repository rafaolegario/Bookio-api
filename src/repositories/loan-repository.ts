import { Loan } from '../entities/Loan'

export abstract class LoanRepository {
  abstract findByTitle(title: string, libraryId: string): Promise<Loan | null>
  abstract findById(loanId: string, libraryId: string): Promise<Loan | null>
  abstract findByLibraryId(libraryId: string): Promise<Loan[]>
  abstract findByReaderId(readerId: string): Promise<Loan[]>
  abstract findOverdueLoans(): Promise<Loan[]>
  abstract create(loan: Loan): Promise<void>
  abstract delete(loanId: string): Promise<void>
  abstract save(loan: Loan): Promise<void>
}
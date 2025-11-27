import { Penality } from '../entities/Penality'

interface PenalityRepository {
  create(penality: Penality): Promise<void>
  findById(id: string): Promise<Penality | null>
  findByLoanId(loanId: string): Promise<Penality | null>
  findByReaderId(readerId: string): Promise<Penality[]>
  findByLibraryId(libraryId: string): Promise<Penality[]>
  findUnpaidPenalities(): Promise<Penality[]>
  delete(id: string): Promise<void>
  update(id: string, penality: Penality): Promise<void>
}

export { PenalityRepository }
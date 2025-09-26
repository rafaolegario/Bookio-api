import { Scheduling } from '../entities/Scheduling'

export interface SchedulingRepository {
  create(scheduling: Scheduling): Promise<void>
  findById(id: string): Promise<Scheduling | null>
  findByReaderId(readerId: string): Promise<Scheduling[]>
  findByBookId(bookId: string): Promise<Scheduling[]>
  findPendingByReaderAndBook(readerId: string, bookId: string): Promise<Scheduling | null>
  delete(id: string): Promise<void>
  update(id: string, scheduling: Scheduling): Promise<void>
  findExpiredSchedulings(): Promise<Scheduling[]>
}
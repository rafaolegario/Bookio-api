import { UniqueEntityId } from './UniqueEntityId'

export enum LoanStatus {
  Returned = 'Returned',
  Overdue = 'Overdue',
  Borrowed = 'Borrowed',
}

export interface LoanProps {
  bookId: UniqueEntityId
  readerId: UniqueEntityId
  returnDate: Date
  status: LoanStatus
  createdAt?: Date
  updatedAt?: Date
}

export class Loan {
  private id: UniqueEntityId
  private bookId: UniqueEntityId
  private readerId: UniqueEntityId
  private returnDate: Date
  private status: LoanStatus
  private createdAt: Date
  private updatedAt: Date

  constructor(props: LoanProps, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId()
    this.bookId = props.bookId
    this.readerId = props.readerId
    this.returnDate = props.returnDate
    this.status = props.status
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  get getId(): string {
    return this.id.toString()
  }

  get getBookId(): UniqueEntityId {
    return this.bookId
  }

  get getReaderId(): UniqueEntityId {
    return this.readerId
  }

  get getReturnDate(): Date {
    return this.returnDate
  }

  get getStatus(): LoanStatus {
    return this.status
  }

  set setStatus(status: LoanStatus) {
    this.status = status
    this.updatedAt = new Date()
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public setReturnDate(date: Date): void {
    this.returnDate = date;
    this.touch();
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }
}

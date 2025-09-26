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
  dueDate: Date
  status: LoanStatus
  actualReturnDate?: Date
  createdAt?: Date
  updatedAt?: Date
}

export class Loan {
  private id: UniqueEntityId
  private bookId: UniqueEntityId
  private readerId: UniqueEntityId
  private returnDate: Date
  private dueDate: Date
  private status: LoanStatus
  private actualReturnDate?: Date
  private createdAt: Date
  private updatedAt: Date

  constructor(props: LoanProps, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId()
    this.bookId = props.bookId
    this.readerId = props.readerId
    this.returnDate = props.returnDate
    this.dueDate = props.dueDate
    this.status = props.status
    this.actualReturnDate = props.actualReturnDate
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

  get getDueDate(): Date {
    return this.dueDate
  }

  get getStatus(): LoanStatus {
    return this.status
  }

  get getActualReturnDate(): Date | undefined {
    return this.actualReturnDate
  }

  set setStatus(status: LoanStatus) {
    this.status = status
    this.updatedAt = new Date()
  }

  set setActualReturnDate(date: Date) {
    this.actualReturnDate = date
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

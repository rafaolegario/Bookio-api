import { UniqueEntityId } from "./UniqueEntityId";

export enum LoanStatus {
  Returned = "Returned",
  Overdue = "Overdue",
  Borrowed = "Borrowed",
}

export interface LoanProps {
  bookId: UniqueEntityId;
  readerId: UniqueEntityId;
  returnDate: Date;
  status: LoanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Loan {
  private id?: number;
  private bookId: UniqueEntityId;
  private readerId: UniqueEntityId;
  private returnDate: Date;
  private status: LoanStatus;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: LoanProps) {
    this.bookId = props.bookId;
    this.readerId = props.readerId;
    this.returnDate = props.returnDate;
    this.status = props.status;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  public getId(): number | undefined {
    return this.id;
  }

  public getBookId(): UniqueEntityId {
    return this.bookId;
  }

  public getReaderId(): UniqueEntityId {
    return this.readerId;
  }

  public getReturnDate(): Date {
    return this.returnDate;
  }

  public getStatus(): LoanStatus {
    return this.status;
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

  public setStatus(status: LoanStatus): void {
    this.status = status;
    this.touch();
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }
}

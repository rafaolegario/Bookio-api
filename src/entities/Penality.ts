import { UniqueEntityId } from './UniqueEntityId'

interface PenalityProps {
  readerId: string
  loanId: string
  amount: number
  paid: boolean
  dueDate: Date
  paymentLink?: string
  createdAt: Date
  updatedAt?: Date
}

export class Penality {
  private props: PenalityProps
  private _id: UniqueEntityId

  constructor(props: PenalityProps, id?: UniqueEntityId) {
    this.props = props
    this._id = id ?? new UniqueEntityId()
  }

  get id() {
    return this._id.toString()
  }

  get readerId() {
    return this.props.readerId
  }

  public isOverdue(): boolean {
    return new Date() > this.props.dueDate;
  }

  get loanId() {
    return this.props.loanId
  }

  get amount() {
    return this.props.amount
  }

  get paid() {
    return this.props.paid
  }

  get dueDate() {
    return this.props.dueDate
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get paymentLink() {
    return this.props.paymentLink
  }

  set paid(paid: boolean) {
    this.props.paid = paid
    this.props.updatedAt = new Date()
  }

  set paymentLink(link: string | undefined) {
    this.props.paymentLink = link
    this.props.updatedAt = new Date()
  }

  set amount(amount: number) {
    this.props.amount = amount
    this.props.updatedAt = new Date()
  }

  set dueDate(date: Date) {
    this.props.dueDate = date
    this.props.updatedAt = new Date()
  }
}

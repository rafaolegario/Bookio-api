import { UniqueEntityId } from './UniqueEntityId'

export enum SchedulingStatus {
  PENDING = 'PENDING',     // Agendamento criado, dentro do prazo de 1h
  EXPIRED = 'EXPIRED',     // Passou do prazo de 1h
  COMPLETED = 'COMPLETED', // Livro foi emprestado com sucesso
  CANCELLED = 'CANCELLED'  // Agendamento foi cancelado
}

interface SchedulingProps {
  readerId: UniqueEntityId
  bookId: UniqueEntityId
  status: SchedulingStatus
  createdAt?: Date
  expiresAt?: Date
  updatedAt?: Date
}

export class Scheduling {
  private id: UniqueEntityId
  private props: SchedulingProps

  constructor(props: SchedulingProps, id?: UniqueEntityId) {
    this.id = id ?? new UniqueEntityId()
    this.props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      expiresAt: props.expiresAt ?? new Date(Date.now() + 60 * 60 * 1000), // 1 hora após a criação
      updatedAt: props.updatedAt ?? new Date(),
    }
  }

  get getId(): string {
    return this.id.toString()
  }

  get getReaderId(): string {
    return this.props.readerId.toString()
  }

  get getBookId(): string {
    return this.props.bookId.toString()
  }

  get getStatus(): SchedulingStatus {
    return this.props.status
  }

  get getCreatedAt(): Date {
    return this.props.createdAt!
  }

  get getExpiresAt(): Date {
    return this.props.expiresAt!
  }

  get getUpdatedAt(): Date {
    return this.props.updatedAt!
  }

  get isExpired(): boolean {
    return new Date() > this.props.expiresAt!
  }

  set setStatus(status: SchedulingStatus) {
    this.props.status = status
    this.props.updatedAt = new Date()
  }
}
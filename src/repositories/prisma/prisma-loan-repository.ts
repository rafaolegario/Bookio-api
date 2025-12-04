import { PrismaClient } from '@prisma/client'
import { LoanRepository } from '../loan-repository'
import { Loan, LoanStatus } from '@/entities/Loan'
import { UniqueEntityId } from '@/entities/UniqueEntityId'

export class PrismaLoanRepository implements LoanRepository {
  constructor(private prisma: PrismaClient) {}

  async findByTitle(title: string, libraryId: string): Promise<Loan | null> {
    const loan = await this.prisma.loan.findFirst({
      where: {
        book: {
          title,
          libraryId,
        },
      },
    })

    if (!loan) return null

    return new Loan(
      {
        bookId: new UniqueEntityId(String(loan.bookId)),
        readerId: new UniqueEntityId(loan.readerId),
        returnDate: loan.returnDate,
        status: loan.status as LoanStatus,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
      },
      new UniqueEntityId(loan.id)
    )
  }

  async findById(loanId: string, libraryId: string): Promise<Loan | null> {
    const loan = await this.prisma.loan.findFirst({
      where: {
        id: loanId,
        book: {
          libraryId: libraryId || undefined,
        },
      },
    })

    if (!loan) return null

    return new Loan(
      {
        bookId: new UniqueEntityId(String(loan.bookId)),
        readerId: new UniqueEntityId(loan.readerId),
        returnDate: loan.returnDate,
        status: loan.status as LoanStatus,
        createdAt: loan.createdAt,
        updatedAt: loan.updatedAt,
      },
      new UniqueEntityId(loan.id)
    )
  }

  async findByLibraryId(libraryId: string): Promise<Loan[]> {
    const loans = await this.prisma.loan.findMany({
      where: {
        book: {
          libraryId,
        },
      },
    })

    return loans.map(
      (loan) =>
        new Loan(
          {
            bookId: new UniqueEntityId(String(loan.bookId)),
            readerId: new UniqueEntityId(loan.readerId),
            returnDate: loan.returnDate,
            status: loan.status as LoanStatus,
            createdAt: loan.createdAt,
            updatedAt: loan.updatedAt,
          },
          new UniqueEntityId(loan.id)
        )
    )
  }

  async findByReaderId(readerId: string): Promise<Loan[]> {
    const loans = await this.prisma.loan.findMany({
      where: { readerId },
    })

    return loans.map(
      (loan) =>
        new Loan(
          {
            bookId: new UniqueEntityId(String(loan.bookId)),
            readerId: new UniqueEntityId(loan.readerId),
            returnDate: loan.returnDate,
            status: loan.status as LoanStatus,
            createdAt: loan.createdAt,
            updatedAt: loan.updatedAt,
          },
          new UniqueEntityId(loan.id)
        )
    )
  }

  async findOverdueLoans(): Promise<Loan[]> {
    const loans = await this.prisma.loan.findMany({
      where: {
        status: 'Borrowed',
        returnDate: {
          lt: new Date(),
        },
      },
    })

    return loans.map(
      (loan) =>
        new Loan(
          {
            bookId: new UniqueEntityId(String(loan.bookId)),
            readerId: new UniqueEntityId(loan.readerId),
            returnDate: loan.returnDate,
            status: loan.status as LoanStatus,
            createdAt: loan.createdAt,
            updatedAt: loan.updatedAt,
          },
          new UniqueEntityId(loan.id)
        )
    )
  }

  async create(loan: Loan): Promise<void> {
    await this.prisma.loan.create({
      data: {
        id: loan.getId,
        bookId: Number(loan.getBookId.toString()),
        readerId: loan.getReaderId.toString(),
        returnDate: loan.getReturnDate,
        returnedAt: loan.getReturnedAt,
        status: loan.getStatus,
        createdAt: loan.getCreatedAt(),
        updatedAt: loan.getUpdatedAt(),
      },
    })
  }

  async delete(loanId: string): Promise<void> {
    await this.prisma.loan.delete({
      where: { id: loanId },
    })
  }

  async save(loan: Loan): Promise<void> {
    await this.prisma.loan.update({
      where: { id: loan.getId },
      data: {
        bookId: Number(loan.getBookId.toString()),
        readerId: loan.getReaderId.toString(),
        returnDate: loan.getReturnDate,
        returnedAt: loan.getReturnedAt,
        status: loan.getStatus,
        updatedAt: loan.getUpdatedAt(),
      },
    })
  }
}

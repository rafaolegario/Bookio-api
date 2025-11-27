import { PrismaClient } from '@prisma/client'
import { PenalityRepository } from '../penality-repository'
import { Penality } from '@/entities/Penality'
import { UniqueEntityId } from '@/entities/UniqueEntityId'

export class PrismaPenalityRepository implements PenalityRepository {
  constructor(private prisma: PrismaClient) {}

  async create(penality: Penality): Promise<void> {
    await this.prisma.penality.create({
      data: {
        id: penality.id,
        readerId: penality.readerId,
        loanId: penality.loanId,
        amount: penality.amount,
        paid: penality.paid,
        dueDate: penality.dueDate,
        createdAt: penality.createdAt,
        updatedAt: penality.updatedAt,
      },
    })
  }

  async findById(id: string): Promise<Penality | null> {
    const penality = await this.prisma.penality.findUnique({
      where: { id },
    })

    if (!penality) return null

    return new Penality(
      {
        readerId: penality.readerId,
        loanId: penality.loanId,
        amount: penality.amount,
        paid: penality.paid,
        dueDate: penality.dueDate,
        createdAt: penality.createdAt,
        updatedAt: penality.updatedAt ?? undefined,
      },
      new UniqueEntityId(penality.id)
    )
  }

  async findByLoanId(loanId: string): Promise<Penality | null> {
    const penality = await this.prisma.penality.findUnique({
      where: { loanId },
    })

    if (!penality) return null

    return new Penality(
      {
        readerId: penality.readerId,
        loanId: penality.loanId,
        amount: penality.amount,
        paid: penality.paid,
        dueDate: penality.dueDate,
        createdAt: penality.createdAt,
        updatedAt: penality.updatedAt ?? undefined,
      },
      new UniqueEntityId(penality.id)
    )
  }

  async findByReaderId(readerId: string): Promise<Penality[]> {
    const penalties = await this.prisma.penality.findMany({
      where: { readerId },
    })

    return penalties.map(
      (penality) =>
        new Penality(
          {
            readerId: penality.readerId,
            loanId: penality.loanId,
            amount: penality.amount,
            paid: penality.paid,
            dueDate: penality.dueDate,
            createdAt: penality.createdAt,
            updatedAt: penality.updatedAt ?? undefined,
          },
          new UniqueEntityId(penality.id)
        )
    )
  }

  async findByLibraryId(libraryId: string): Promise<Penality[]> {
    const penalties = await this.prisma.penality.findMany({
      where: {
        reader: {
          libraryId: libraryId
        }
      },
      include: {
        reader: true,
        loan: {
          include: {
            book: true
          }
        }
      }
    })

    return penalties.map(
      (penality) =>
        new Penality(
          {
            readerId: penality.readerId,
            loanId: penality.loanId,
            amount: penality.amount,
            paid: penality.paid,
            dueDate: penality.dueDate,
            createdAt: penality.createdAt,
            updatedAt: penality.updatedAt ?? undefined,
          },
          new UniqueEntityId(penality.id)
        )
    )
  }

  async findUnpaidPenalities(): Promise<Penality[]> {
    const penalties = await this.prisma.penality.findMany({
      where: { paid: false },
    })

    return penalties.map(
      (penality) =>
        new Penality(
          {
            readerId: penality.readerId,
            loanId: penality.loanId,
            amount: penality.amount,
            paid: penality.paid,
            dueDate: penality.dueDate,
            createdAt: penality.createdAt,
            updatedAt: penality.updatedAt ?? undefined,
          },
          new UniqueEntityId(penality.id)
        )
    )
  }

  async delete(id: string): Promise<void> {
    await this.prisma.penality.delete({
      where: { id },
    })
  }

  async update(id: string, penality: Penality): Promise<void> {
    await this.prisma.penality.update({
      where: { id },
      data: {
        readerId: penality.readerId,
        loanId: penality.loanId,
        amount: penality.amount,
        paid: penality.paid,
        dueDate: penality.dueDate,
        updatedAt: penality.updatedAt,
      },
    })
  }
}

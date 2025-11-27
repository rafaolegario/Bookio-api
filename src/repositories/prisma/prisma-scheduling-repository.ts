import { PrismaClient } from '@prisma/client'
import { SchedulingRepository } from '../scheduling-repository'
import { Scheduling, SchedulingStatus } from '@/entities/Scheduling'
import { UniqueEntityId } from '@/entities/UniqueEntityId'

export class PrismaSchedulingRepository implements SchedulingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(scheduling: Scheduling): Promise<void> {
    await this.prisma.scheduling.create({
      data: {
        id: scheduling.getId,
        readerId: scheduling.getReaderId,
        bookId: Number(scheduling.getBookId),
        status: scheduling.getStatus,
        createdAt: scheduling.getCreatedAt,
        expiresAt: scheduling.getExpiresAt,
        updatedAt: scheduling.getUpdatedAt,
      },
    })
  }

  async findById(id: string): Promise<Scheduling | null> {
    const scheduling = await this.prisma.scheduling.findUnique({
      where: { id },
    })

    if (!scheduling) return null

    return new Scheduling(
      {
        readerId: new UniqueEntityId(scheduling.readerId),
        bookId: new UniqueEntityId(String(scheduling.bookId)),
        status: scheduling.status as SchedulingStatus,
        createdAt: scheduling.createdAt,
        expiresAt: scheduling.expiresAt,
        updatedAt: scheduling.updatedAt,
      },
      new UniqueEntityId(scheduling.id)
    )
  }

  async findByReaderId(readerId: string): Promise<Scheduling[]> {
    const schedulings = await this.prisma.scheduling.findMany({
      where: { readerId },
    })

    return schedulings.map(
      (scheduling) =>
        new Scheduling(
          {
            readerId: new UniqueEntityId(scheduling.readerId),
            bookId: new UniqueEntityId(String(scheduling.bookId)),
            status: scheduling.status as SchedulingStatus,
            createdAt: scheduling.createdAt,
            expiresAt: scheduling.expiresAt,
            updatedAt: scheduling.updatedAt,
          },
          new UniqueEntityId(scheduling.id)
        )
    )
  }

  async findByBookId(bookId: string): Promise<Scheduling[]> {
    const schedulings = await this.prisma.scheduling.findMany({
      where: { bookId: Number(bookId) },
    })

    return schedulings.map(
      (scheduling) =>
        new Scheduling(
          {
            readerId: new UniqueEntityId(scheduling.readerId),
            bookId: new UniqueEntityId(String(scheduling.bookId)),
            status: scheduling.status as SchedulingStatus,
            createdAt: scheduling.createdAt,
            expiresAt: scheduling.expiresAt,
            updatedAt: scheduling.updatedAt,
          },
          new UniqueEntityId(scheduling.id)
        )
    )
  }

  async findByLibraryId(libraryId: string): Promise<Scheduling[]> {
    const schedulings = await this.prisma.scheduling.findMany({
      where: {
        book: {
          libraryId: libraryId
        }
      },
      include: {
        reader: true,
        book: true
      }
    })

    return schedulings.map(
      (scheduling) =>
        new Scheduling(
          {
            readerId: new UniqueEntityId(scheduling.readerId),
            bookId: new UniqueEntityId(String(scheduling.bookId)),
            status: scheduling.status as SchedulingStatus,
            createdAt: scheduling.createdAt,
            expiresAt: scheduling.expiresAt,
            updatedAt: scheduling.updatedAt,
          },
          new UniqueEntityId(scheduling.id)
        )
    )
  }

  async findPendingByReaderAndBook(
    readerId: string,
    bookId: string
  ): Promise<Scheduling | null> {
    const scheduling = await this.prisma.scheduling.findFirst({
      where: {
        readerId,
        bookId: Number(bookId),
        status: 'PENDING',
      },
    })

    if (!scheduling) return null

    return new Scheduling(
      {
        readerId: new UniqueEntityId(scheduling.readerId),
        bookId: new UniqueEntityId(String(scheduling.bookId)),
        status: scheduling.status as SchedulingStatus,
        createdAt: scheduling.createdAt,
        expiresAt: scheduling.expiresAt,
        updatedAt: scheduling.updatedAt,
      },
      new UniqueEntityId(scheduling.id)
    )
  }

  async delete(id: string): Promise<void> {
    await this.prisma.scheduling.delete({
      where: { id },
    })
  }

  async update(id: string, scheduling: Scheduling): Promise<void> {
    await this.prisma.scheduling.update({
      where: { id },
      data: {
        readerId: scheduling.getReaderId,
        bookId: Number(scheduling.getBookId),
        status: scheduling.getStatus,
        expiresAt: scheduling.getExpiresAt,
        updatedAt: scheduling.getUpdatedAt,
      },
    })
  }

  async findExpiredSchedulings(): Promise<Scheduling[]> {
    const schedulings = await this.prisma.scheduling.findMany({
      where: {
        status: 'PENDING',
        expiresAt: {
          lt: new Date(),
        },
      },
    })

    return schedulings.map(
      (scheduling) =>
        new Scheduling(
          {
            readerId: new UniqueEntityId(scheduling.readerId),
            bookId: new UniqueEntityId(String(scheduling.bookId)),
            status: scheduling.status as SchedulingStatus,
            createdAt: scheduling.createdAt,
            expiresAt: scheduling.expiresAt,
            updatedAt: scheduling.updatedAt,
          },
          new UniqueEntityId(scheduling.id)
        )
    )
  }
}

import { PrismaClient } from '@prisma/client'
import { ReaderRepository } from '../reader-repository'
import { Reader } from '@/entities/Reader'
import { UniqueEntityId } from '@/entities/UniqueEntityId'
import { Roles } from '@/entities/User'

export class PrismaReaderRepository implements ReaderRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Reader | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'READER',
      },
    })

    if (!user || !user.cpf) return null

    return new Reader({
      id: new UniqueEntityId(user.id),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as Roles,
      address: {
        cep: user.cep,
        street: user.street,
        neighborhood: user.neighborhood,
        city: user.city,
        number: user.number,
      },
      cpf: user.cpf,
      pictureUrl: user.pictureUrl ?? undefined,
      active: user.active ?? true,
      suspense: user.suspense ?? 0,
      libraryId: new UniqueEntityId(user.libraryId!),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findByCpf(cpf: string): Promise<Reader | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        cpf,
        role: 'READER',
      },
    })

    if (!user || !user.cpf) return null

    return new Reader({
      id: new UniqueEntityId(user.id),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as Roles,
      address: {
        cep: user.cep,
        street: user.street,
        neighborhood: user.neighborhood,
        city: user.city,
        number: user.number,
      },
      cpf: user.cpf,
      pictureUrl: user.pictureUrl ?? undefined,
      active: user.active ?? true,
      suspense: user.suspense ?? 0,
      libraryId: new UniqueEntityId(user.libraryId!),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findById(id: string): Promise<Reader | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'READER',
      },
    })

    if (!user || !user.cpf) return null

    return new Reader({
      id: new UniqueEntityId(user.id),
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role as Roles,
      address: {
        cep: user.cep,
        street: user.street,
        neighborhood: user.neighborhood,
        city: user.city,
        number: user.number,
      },
      cpf: user.cpf,
      pictureUrl: user.pictureUrl ?? undefined,
      active: user.active ?? true,
      suspense: user.suspense ?? 0,
      libraryId: new UniqueEntityId(user.libraryId!),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findByLibraryId(libraryId: string): Promise<Reader[]> {
    const users = await this.prisma.user.findMany({
      where: {
        libraryId,
        role: 'READER',
      },
    })

    return users
      .filter((user) => user.cpf !== null)
      .map(
        (user) =>
          new Reader({
            id: new UniqueEntityId(user.id),
            name: user.name,
            email: user.email,
            password: user.password,
            role: user.role as Roles,
            address: {
              cep: user.cep,
              street: user.street,
              neighborhood: user.neighborhood,
              city: user.city,
              number: user.number,
            },
            cpf: user.cpf!,
            pictureUrl: user.pictureUrl ?? undefined,
            active: user.active ?? true,
            suspense: user.suspense ?? 0,
            libraryId: new UniqueEntityId(user.libraryId!),
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })
      )
  }

  async create(reader: Reader): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: reader.getId().toString(),
        name: reader.getName(),
        email: reader.getEmail(),
        password: reader.getPassword(),
        role: 'READER',
        cep: reader.getAddress().cep,
        street: reader.getAddress().street,
        neighborhood: reader.getAddress().neighborhood,
        city: reader.getAddress().city,
        number: reader.getAddress().number,
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        libraryId: reader.getLibraryId().toString(),
      },
    })
  }

  async save(reader: Reader): Promise<void> {
    await this.prisma.user.update({
      where: { id: reader.getId().toString() },
      data: {
        name: reader.getName(),
        email: reader.getEmail(),
        password: reader.getPassword(),
        cep: reader.getAddress().cep,
        street: reader.getAddress().street,
        neighborhood: reader.getAddress().neighborhood,
        city: reader.getAddress().city,
        number: reader.getAddress().number,
        cpf: reader.getCpf(),
        pictureUrl: reader.getPictureUrl(),
        active: reader.isActive(),
        suspense: reader.getSuspense(),
        libraryId: reader.getLibraryId().toString(),
        updatedAt: new Date(),
      },
    })
  }
}

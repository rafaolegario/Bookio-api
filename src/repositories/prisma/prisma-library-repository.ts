import { PrismaClient } from '@prisma/client'
import { LibraryRepository } from '../library-repository'
import { Library } from '@/entities/Library'
import { UniqueEntityId } from '@/entities/UniqueEntityId'
import { Roles } from '@/entities/User'

export class PrismaLibraryRepository implements LibraryRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<Library | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        role: 'LIBRARY',
      },
    })

    if (!user || !user.cnpj) return null

    return new Library({
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
      cnpj: user.cnpj,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findByCnpj(cnpj: string): Promise<Library | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        cnpj,
        role: 'LIBRARY',
      },
    })

    if (!user || !user.cnpj) return null

    return new Library({
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
      cnpj: user.cnpj,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findById(id: string): Promise<Library | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'LIBRARY',
      },
    })

    if (!user || !user.cnpj) return null

    return new Library({
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
      cnpj: user.cnpj,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async create(library: Library): Promise<void> {
    await this.prisma.user.create({
      data: {
        id: library.getId().toString(),
        name: library.getName(),
        email: library.getEmail(),
        password: library.getPassword(),
        role: 'LIBRARY',
        cep: library.getAddress().cep,
        street: library.getAddress().street,
        neighborhood: library.getAddress().neighborhood,
        city: library.getAddress().city,
        number: library.getAddress().number,
        cnpj: library.getCnpj(),
      },
    })
  }

  async save(library: Library): Promise<void> {
    await this.prisma.user.update({
      where: { id: library.getId().toString() },
      data: {
        name: library.getName(),
        email: library.getEmail(),
        password: library.getPassword(),
        cep: library.getAddress().cep,
        street: library.getAddress().street,
        neighborhood: library.getAddress().neighborhood,
        city: library.getAddress().city,
        number: library.getAddress().number,
        cnpj: library.getCnpj(),
        updatedAt: new Date(),
      },
    })
  }
}

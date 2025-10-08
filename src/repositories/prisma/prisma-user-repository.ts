import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../user-repository'
import { User, Roles } from '@/entities/User'
import { UniqueEntityId } from '@/entities/UniqueEntityId'

export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User({
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async findById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User({
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id: userId },
    })
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.getId().toString() },
      data: {
        name: user.getName(),
        email: user.getEmail(),
        password: user.getPassword(),
        role: user.getRole(),
        cep: user.getAddress().cep,
        street: user.getAddress().street,
        neighborhood: user.getAddress().neighborhood,
        city: user.getAddress().city,
        number: user.getAddress().number,
        updatedAt: new Date(),
      },
    })
  }
}

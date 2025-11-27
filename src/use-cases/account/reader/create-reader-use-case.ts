import { Reader } from "@/entities/Reader";
import { UniqueEntityId } from "@/entities/UniqueEntityId";
import { Roles } from "@/entities/User";
import { ReaderRepository } from "@/repositories/reader-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

interface createReaderRequest {
  name: string;
  email: string;
  libraryId: string;
  cpf: string;
  pictureUrl: string;
  Address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    number: string;
  };
}

function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
  const bytes = randomBytes(length);
  let password = '';

  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  return password;
}

export class CreateReaderUseCase {
  constructor(
    private ReaderRepository: ReaderRepository
  ) { }

  async execute({
    name,
    email,
    libraryId,
    cpf,
    Address,
    pictureUrl
  }: createReaderRequest) {
    let reader = await this.ReaderRepository.findByEmail(email);

    if (reader) {
      throw new NotAllowedError('Este e-mail já está cadastrado');
    }

    reader = await this.ReaderRepository.findByCpf(cpf);

    if (reader) {
      throw new NotAllowedError('Este CPF já está cadastrado');
    }

    // Gera senha aleatória
    const randomPassword = generateRandomPassword(12);
    const hashedPassword = await hash(randomPassword, 6);

    reader = new Reader({
      name,
      email,
      libraryId: new UniqueEntityId(libraryId),
      pictureUrl,
      cpf: cpf,
      role: Roles.READER,
      password: hashedPassword,
      address: Address,
    });

    await this.ReaderRepository.create(reader);

    // Retorna a senha gerada para ser enviada pela API
    return {
      reader,
      password: randomPassword
    };
  }
}

import { Reader } from "@/entities/Reader";
import { UniqueEntityId } from "@/entities/UniqueEntityId";
import { Roles } from "@/entities/User";
import { ReaderRepository } from "@/repositories/reader-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { hash } from "bcryptjs";

interface createReaderRequest {
  name: string;
  email: string;
  password: string;
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

export class CreateReaderUseCase {
  constructor(private ReaderRepository: ReaderRepository) { }
  async execute({
    name,
    email,
    password,
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

    const hashedPassword = await hash(password, 6);

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
  }
}

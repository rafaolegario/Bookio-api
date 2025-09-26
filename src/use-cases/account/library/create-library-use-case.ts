import { Library } from "@/entities/Library";
import { Roles } from "@/entities/User";
import { LibraryRepository } from "@/repositories/library-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { hash } from "bcryptjs";

interface createLibraryRequest {
  name: string;
  email: string;
  password: string;
  cnpj: string;
  Address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    number: string;
  };
}

export class CreateLibraryUseCase {
  constructor(private LibraryRepository: LibraryRepository) { }
  async execute({
    name,
    email,
    password,
    cnpj,
    Address,
  }: createLibraryRequest) {
    let library = await this.LibraryRepository.findByEmail(email);

    if (library) {
      throw new NotAllowedError('Este e-mail já está cadastrado');
    }

    library = await this.LibraryRepository.findByCnpj(cnpj);

    if (library) {
      throw new NotAllowedError('Este CNPJ já está cadastrado');
    }

    const hashedPassword = await hash(password, 6);

    library = new Library({
      name,
      email,
      cnpj,
      role: Roles.LIBRARY,
      password: hashedPassword,
      address: Address,
    });

    await this.LibraryRepository.create(library);
  }
}

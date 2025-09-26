import { LibraryRepository } from "@/repositories/library-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface updateLibraryRequest {
  libraryId: string;
  name?: string;
  email?: string;
  cnpj?: string;
  address?: {
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    number?: string;
  };
}

export class UpdateLibraryUseCase {
  constructor(private libraryRepository: LibraryRepository) { }

  async execute({
    libraryId,
    name,
    email,
    cnpj,
    address,
  }: updateLibraryRequest) {
    let library = await this.libraryRepository.findById(libraryId);

    if (!library) {
      throw new NotFoundError();
    }

    if (email && email !== library.getEmail()) {
      const existingLibraryByEmail = await this.libraryRepository.findByEmail(email);
      if (existingLibraryByEmail) {
        throw new NotAllowedError('Este e-mail já está em uso por outra biblioteca');
      }
    }

    if (cnpj && cnpj !== library.getCnpj()) {
      const existingLibraryByCnpj = await this.libraryRepository.findByCnpj(cnpj);
      if (existingLibraryByCnpj) {
        throw new NotAllowedError('Este CNPJ já está em uso por outra biblioteca');
      }
    }

    if (name) library.setName(name);
    if (email) library.setEmail(email);
    if (cnpj) library.setCnpj(cnpj);
    if (address) {
      const validatedAddress = {
        cep: address.cep || "",
        street: address.street || "",
        neighborhood: address.neighborhood || "",
        city: address.city || "",
        number: address.number || "",
      };
      library.setAddress(validatedAddress);
    }


    await this.libraryRepository.save(library);

    return library;
  }
}

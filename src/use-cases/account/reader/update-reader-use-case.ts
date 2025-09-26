import { ReaderRepository } from "@/repositories/reader-repository";
import { NotAllowedError } from "@/use-cases/errors/not-allowed-error";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface updateReaderRequest {
  readerId: string;
  name?: string;
  email?: string;
  cpf?: string;
  pictureUrl?: string;
  address?: {
    cep?: string;
    street?: string;
    neighborhood?: string;
    city?: string;
    number?: string;
  };
}

export class UpdateReaderUseCase {
  constructor(private readerRepository: ReaderRepository) { }

  async execute({
    readerId,
    name,
    email,
    cpf,
    pictureUrl,
    address,
  }: updateReaderRequest) {
    let reader = await this.readerRepository.findById(readerId);

    if (!reader) {
      throw new NotFoundError();
    }

    if (email && email !== reader.getEmail()) {
      const existingReaderByEmail = await this.readerRepository.findByEmail(email);
      if (existingReaderByEmail) {
        throw new NotAllowedError('Este e-mail já está em uso por outro leitor');
      }
    }

    if (cpf && cpf !== reader.getCpf()) {
      const existingReaderByCpf = await this.readerRepository.findByCpf(cpf);
      if (existingReaderByCpf) {
        throw new NotAllowedError('Este CPF já está em uso por outro leitor');
      }
    }

    if (name) reader.setName(name);
    if (email) reader.setEmail(email);
    if (cpf) reader.setCpf(cpf);
    if (pictureUrl) reader.setPictureUrl(pictureUrl);

    if (address) {
      const validatedAddress = {
        cep: address.cep || "",
        street: address.street || "",
        neighborhood: address.neighborhood || "",
        city: address.city || "",
        number: address.number || "",
      };
      reader.setAddress(validatedAddress);
    }

    await this.readerRepository.save(reader);

    return reader;
  }
}

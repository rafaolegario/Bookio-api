import { ReaderRepository } from "@/repositories/reader-repository";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface getReaderRequest {
  readerId: string;
}

export class GetReaderUseCase {
  constructor(private readerRepository: ReaderRepository) {}

  async execute({ readerId }: getReaderRequest) {
    const reader = await this.readerRepository.findById(readerId);

    if (!reader) {
      throw new NotFoundError();
    }

    return reader;
  }
}

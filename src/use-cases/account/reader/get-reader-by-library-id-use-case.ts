import { ReaderRepository } from "@/repositories/reader-repository";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface getReadersByLibraryIdRequest {
  libraryId: string;
}

export class GetReadersByLibraryIdUseCase {
  constructor(private readerRepository: ReaderRepository) {}

  async execute({ libraryId }: getReadersByLibraryIdRequest) {
    const readers = await this.readerRepository.findByLibraryId(libraryId);

    if (!readers || readers.length === 0) {
      throw new NotFoundError();
    }

    return readers;
  }
}

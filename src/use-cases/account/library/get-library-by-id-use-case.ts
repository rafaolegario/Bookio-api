import { LibraryRepository } from "@/repositories/library-repository";
import { NotFoundError } from "@/use-cases/errors/not-found-error";

interface getLibraryRequest {
  libraryId: string;
}

export class GetLibraryUseCase {
  constructor(private libraryRepository: LibraryRepository) {}

  async execute({ libraryId }: getLibraryRequest) {
    const library = await this.libraryRepository.findById(libraryId);

    if (!library) {
      throw new NotFoundError();
    }

    return library;
  }
}

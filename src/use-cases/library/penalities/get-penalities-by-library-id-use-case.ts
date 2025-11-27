import { PenalityRepository } from '@/repositories/penality-repository'

interface GetPenalitiesByLibraryIdRequest {
  libraryId: string
}

export class GetPenalitiesByLibraryIdUseCase {
  constructor(private penalityRepository: PenalityRepository) {}

  async execute({ libraryId }: GetPenalitiesByLibraryIdRequest) {
    const penalities = await this.penalityRepository.findByLibraryId(libraryId)

    return {
      penalities,
    }
  }
}

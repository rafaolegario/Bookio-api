import { PenalityRepository } from '../../../repositories/penality-repository'

interface GetPenalitiesByReaderIdUseCaseRequest {
  readerId: string
}

export class GetPenalitiesByReaderIdUseCase {
  constructor(private penalityRepository: PenalityRepository) { }

  async execute({ readerId }: GetPenalitiesByReaderIdUseCaseRequest) {
    const penalities = await this.penalityRepository.findByReaderId(readerId)

    return {
      penalities,
    }
  }
}
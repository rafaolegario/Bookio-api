import { PenalityRepository } from '../../../repositories/penality-repository'
import { NotFoundError } from '../../errors/not-found-error'

interface GetPenalityByIdUseCaseRequest {
  penalityId: string
}

export class GetPenalityByIdUseCase {
  constructor(private penalityRepository: PenalityRepository) { }

  async execute({ penalityId }: GetPenalityByIdUseCaseRequest) {
    const penality = await this.penalityRepository.findById(penalityId)

    if (!penality) {
      throw new NotFoundError()
    }

    return {
      penality,
    }
  }
}
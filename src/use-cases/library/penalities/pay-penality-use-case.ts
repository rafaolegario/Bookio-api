import { PenalityRepository } from '../../../repositories/penality-repository'
import { NotFoundError } from '../../errors/not-found-error'

interface PayPenalityUseCaseRequest {
  penalityId: string
}

export class PayPenalityUseCase {
  constructor(private penalityRepository: PenalityRepository) { }

  async execute({ penalityId }: PayPenalityUseCaseRequest) {
    const penality = await this.penalityRepository.findById(penalityId)

    if (!penality) {
      throw new NotFoundError()
    }

    penality.paid = true

    await this.penalityRepository.update(penalityId, penality)

    return {
      penality,
    }
  }
}
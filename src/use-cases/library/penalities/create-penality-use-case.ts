import { PenalityRepository } from '../../../repositories/penality-repository'
import { Penality } from '../../../entities/Penality'

interface CreatePenalityUseCaseRequest {
  readerId: string
  loanId: string
  amount: number
  dueDate: Date
}

type CreatePenalityUseCaseResponse = {
  penality: Penality
}

export class CreatePenalityUseCase {
  constructor(private penalityRepository: PenalityRepository) { }

  async execute({
    readerId,
    loanId,
    amount,
    dueDate,
  }: CreatePenalityUseCaseRequest): Promise<CreatePenalityUseCaseResponse> {
    const penality = new Penality({
      readerId,
      loanId,
      amount,
      paid: false,
      dueDate,
      createdAt: new Date(),
    })

    await this.penalityRepository.create(penality)

    return {
      penality,
    }
  }
}
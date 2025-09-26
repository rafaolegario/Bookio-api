import { SchedulingRepository } from '../../../repositories/scheduling-repository'
import { NotFoundError } from '../../errors/not-found-error'

interface GetSchedulingByIdUseCaseRequest {
  schedulingId: string
}

export class GetSchedulingByIdUseCase {
  constructor(private schedulingRepository: SchedulingRepository) { }

  async execute({ schedulingId }: GetSchedulingByIdUseCaseRequest) {
    const scheduling = await this.schedulingRepository.findById(schedulingId)

    if (!scheduling) {
      throw new NotFoundError()
    }

    return {
      scheduling,
    }
  }
}
import { SchedulingRepository } from '../../../repositories/scheduling-repository'

interface ListSchedulingsByReaderUseCaseRequest {
  readerId: string
}

export class ListSchedulingsByReaderUseCase {
  constructor(private schedulingRepository: SchedulingRepository) { }

  async execute({ readerId }: ListSchedulingsByReaderUseCaseRequest) {
    const schedulings = await this.schedulingRepository.findByReaderId(readerId)

    return {
      schedulings,
    }
  }
}
import { SchedulingRepository } from '@/repositories/scheduling-repository'

interface GetSchedulingsByLibraryIdRequest {
  libraryId: string
}

export class GetSchedulingsByLibraryIdUseCase {
  constructor(private schedulingRepository: SchedulingRepository) {}

  async execute({ libraryId }: GetSchedulingsByLibraryIdRequest) {
    const schedulings = await this.schedulingRepository.findByLibraryId(libraryId)

    return {
      schedulings,
    }
  }
}

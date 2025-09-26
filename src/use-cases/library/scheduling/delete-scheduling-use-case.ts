import { SchedulingRepository } from '../../../repositories/scheduling-repository'
import { NotFoundError } from '../../errors/not-found-error'
import { NotAllowedError } from '../../errors/not-allowed-error'
import { SchedulingStatus } from '../../../entities/Scheduling'

interface DeleteSchedulingUseCaseRequest {
  schedulingId: string
  readerId: string // Para garantir que apenas o próprio leitor possa cancelar
}

export class DeleteSchedulingUseCase {
  constructor(private schedulingRepository: SchedulingRepository) { }

  async execute({ schedulingId, readerId }: DeleteSchedulingUseCaseRequest) {
    const scheduling = await this.schedulingRepository.findById(schedulingId)

    if (!scheduling) {
      throw new NotFoundError()
    }

    if (scheduling.getReaderId !== readerId) {
      throw new NotAllowedError('Você não tem permissão para cancelar este agendamento')
    }

    if (scheduling.getStatus === SchedulingStatus.COMPLETED) {
      throw new Error('Cannot delete a completed scheduling')
    }

    scheduling.setStatus = SchedulingStatus.CANCELLED
    await this.schedulingRepository.update(schedulingId, scheduling)

    return {
      scheduling,
    }
  }
}